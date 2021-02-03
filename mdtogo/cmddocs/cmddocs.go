// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cmddocs

import (
	"bufio"
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func ParseCmdDocs(files []string) []doc {
	var docs []doc
	for _, path := range files {
		b, err := ioutil.ReadFile(path)
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err)
			os.Exit(1)
		}
		parsedDocs := parse(path, string(b))

		docs = append(docs, parsedDocs...)
	}
	return docs
}

var (
	mdtogoTag         = regexp.MustCompile(`<!--mdtogo:(Short|Long|Examples)-->([\s\S]*?)<!--mdtogo-->`)
	mdtogoInternalTag = regexp.MustCompile(`<!--mdtogo:(Short|Long|Examples)\s+?([\s\S]*?)-->`)
)

func parse(path, value string) []doc {
	pathDir := filepath.Dir(path)
	_, name := filepath.Split(pathDir)

	name = strings.Title(name)
	name = strings.ReplaceAll(name, "-", "")

	matches := mdtogoTag.FindAllStringSubmatch(value, -1)
	matches = append(matches, mdtogoInternalTag.FindAllStringSubmatch(value, -1)...)

	var docs []doc
	var doc doc
	for _, match := range matches {
		switch match[1] {
		case "Short":
			val := strings.TrimSpace(match[2])
			doc.Short = val
		case "Long":
			val := cleanUpContent(match[2])
			doc.Long = val
		case "Examples":
			val := cleanUpContent(match[2])
			doc.Examples = val
		}
	}
	doc.Name = name

	docs = append(docs, doc)
	return docs
}

func cleanUpContent(text string) string {
	var lines []string

	scanner := bufio.NewScanner(bytes.NewBufferString(strings.Trim(text, "\n")))

	indent := false
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "```") {
			indent = !indent
			continue
		}

		if indent {
			line = "  " + line
		}

		line = strings.ReplaceAll(line, "`", "` + \"`\" + `")

		if strings.HasPrefix(line, "####") {
			line = strings.TrimPrefix(line, "####")
			line = fmt.Sprintf("%s:", strings.TrimSpace(line))
		}

		lines = append(lines, line)
	}

	return fmt.Sprintf("\n%s\n", strings.Join(lines, "\n"))
}

type doc struct {
	Name     string
	Short    string
	Long     string
	Examples string
}

func (d doc) String() string {
	var parts []string

	if d.Short != "" {
		parts = append(parts,
			fmt.Sprintf("var %sShort = `%s`", d.Name, d.Short))
	}
	if d.Long != "" {
		parts = append(parts,
			fmt.Sprintf("var %sLong = `%s`", d.Name, d.Long))
	}
	if d.Examples != "" {
		parts = append(parts,
			fmt.Sprintf("var %sExamples = `%s`", d.Name, d.Examples))
	}

	return strings.Join(parts, "\n") + "\n"
}

func Write(docs []doc, dest, license string) error {
	out := []string{license, `
// Code generated by "mdtogo"; DO NOT EDIT.
package ` + filepath.Base(dest) + "\n"}

	for i := range docs {
		out = append(out, docs[i].String())
	}

	if _, err := os.Stat(dest); err != nil {
		_ = os.Mkdir(dest, 0700)
	}

	o := strings.Join(out, "\n")
	return ioutil.WriteFile(filepath.Join(dest, "docs.go"), []byte(o), 0600)
}
