// Matches a path like /book/02-concepts/01-packages
const bookPath = /^\/book\/(\d+)-(.+)\/(\d+)?-?(.+)?/;

function addGitHubWidget(hook) {
  const issueIcon = document.createElement("span");
  issueIcon.innerText = "bug_report";
  issueIcon.classList.add("material-icons-outlined");
  const createIssue = document.createElement("a");
  createIssue.target = "_blank";
  createIssue.title = "Create documentation issue";
  createIssue.appendChild(issueIcon);

  const editIcon = document.createElement("span");
  editIcon.innerText = "edit";
  editIcon.classList.add("material-icons-outlined");
  const editPage = document.createElement("a");
  editPage.target = "_blank";
  editPage.title = "Edit this page";
  editPage.appendChild(editIcon);

  // Refresh widget links.
  hook.doneEach(function () {
    createIssue.href = `https://github.com/GoogleContainerTools/kpt/issues/new?labels=documentation&title=Docs: ${document.title}`;

    let path = document.location.pathname;
    const pageName = path.match(bookPath) ? "00.md" : "README.md";
    path += path.endsWith("/") ? pageName : ".md";
    editPage.href = `https://github.com/GoogleContainerTools/kpt/edit/next/site${path}`;

    const container = document.createElement("div");
    container.classList.add("github-widget");
    container.appendChild(createIssue);
    container.appendChild(editPage);
    document.getElementById("main").appendChild(container);
  });
}

function convertFromHugo(content) {
  const hugoHideDirectives = /{{% hide %}}.+?{{% \/hide %}}/gms;
  const hugoDirectiveTags = /{{.*}}/g;

  content = processHugoTitleHeading(content);
  return content.replace(hugoHideDirectives, "").replace(hugoDirectiveTags, "");
}

function showBookPageFooters() {
  const paginationFooters = Array.from(
    document.getElementsByClassName("docsify-pagination-container")
  );
  const isBookPage = document.location.pathname
    .toLowerCase()
    .startsWith("/book");
  paginationFooters.forEach(
    (el) => (el.style.display = isBookPage ? "flex" : "none")
  );

  // Don't show previous button on the book cover page.
  const previousPaginationButtons = Array.from(
    document.getElementsByClassName("pagination-item--previous")
  );
  const isBookCover =
    isBookPage && document.location.pathname.toLowerCase().length < 7;
  previousPaginationButtons.forEach(
    (el) => (el.style.display = isBookCover ? "none" : "flex")
  );

  // Don't show next button to non-book-pages.
  const nextPaginationButtons = Array.from(
    document.getElementsByClassName("pagination-item--next")
  );
  nextPaginationButtons.forEach((el) => {
    url = new URL(el.lastElementChild.href);
    el.style.display = url.pathname.toLowerCase().startsWith("/book")
      ? "flex"
      : "none";
  });
}

function processBookPageTitle(content) {
  const pathname = window.location.pathname.toLowerCase();

  const bookPathMatch = pathname.match(bookPath);

  if (bookPathMatch) {
    const pageNumber = parseInt(bookPathMatch[3]);

    // Use chapter name if on intro page and page name otherwise.
    const chapterNum = `# ${parseInt(bookPathMatch[1])}${
      pageNumber > 0 ? `.${pageNumber}` : ""
    }`;
    const pageTitle = pageNumber > 0 ? bookPathMatch[4] : bookPathMatch[2];

    content =
      `${chapterNum} ${pageTitle.replaceAll("-", " ").toTitleCase()}\n` +
      content;
  }

  return content;
}

function addSidebarCollapsibility(sidebar) {
  const tocLists = Array.from(sidebar?.getElementsByTagName("ul"));

  // Hide a child list if neither its parent nor any of its descendants are active.
  tocLists.forEach((ul) =>
    ul.parentElement.classList.contains("active") ||
    ul.getElementsByClassName("active").length
      ? ul.classList.remove("inactive")
      : ul.classList.add("inactive")
  );
}

// Make Markdown standard titles (# Title) out of the following:
// +++
// title: Page Title
// +++
function processHugoTitleHeading(content) {
  const titleBlock = /^[\+\-]{3}[\s\S]*?^[\+\-]{3}$/m;
  const titleMatch = content.match(/title:\s*["'](.*)["']/);

  const titleHeading = titleMatch ? `# ${titleMatch[1]}` : "";

  return content.replace(titleBlock, titleHeading);
}

// Convert Hugo Asciinema directives to HTML.
function processAsciinemaTags(content) {
  const asciinemaDirective = /{{<\s*asciinema.+key="(.+?)".+}}/g;

  return content.replace(
    asciinemaDirective,
    (_, fileName) =>
      `<asciinema-player src="${window.location.origin}/static/casts/${fileName}.cast" cols="160"></asciinema-player>`
  );
}

function activateMissingSlashLinks(sidebar) {
  const sidebarLinks = Array.from(sidebar.getElementsByTagName("a"));
  const slashedPath = document.location.href + '/';

  sidebarLinks.forEach(a => a.href === slashedPath && a.parentElement.classList.add('active'));
}

function localPlugins(hook, _vm) {
  // Process Markdown directives appropriately.
  hook.beforeEach(function (content) {
    content = processAsciinemaTags(content);

    // Until all source markdown files stop using Hugo directives,
    // convert here for compatibility.
    content = convertFromHugo(content);
    return content;
  });

  // Add title to book Markdown pages based on directory structure.
  hook.beforeEach(processBookPageTitle);

  // Show navigation footer for book pages.
  hook.doneEach(showBookPageFooters);

  addGitHubWidget(hook);

  // Process elements in the navigation sidebar.
  hook.doneEach(function () {
    const sidebar = document.getElementsByClassName("sidebar-nav").item(0);

    activateMissingSlashLinks(sidebar);

    // Only show child pages for currently active page to avoid sidebar cluttering.
    addSidebarCollapsibility(sidebar);
  });
}

// Load plugins into Docsify.
window.$docsify = window.$docsify || {};
window.$docsify.plugins = [localPlugins].concat(window.$docsify.plugins || []);
