CodeMirror.defineSimpleMode("simplemode", {
      // The start state contains the rules that are intially used
    start: [
        { regex: /\/\/.*/, token: "comment" },
        { regex: /\/\*/, token: "comment", next: "comment" },
        
        { regex: /\(\((OR|KO)\)\)/, token: "atom", sol: true },
        { regex: /(\(\(LV\)\))(\t)([A-Z][A-Z0-9])/,
          token: ["atom", null, "string"], sol: true },
        { regex: /(\[.+?\])(\t)(\(\(.+?\)\))?(.*)/,
          token: ["keyword", null, "string", null], sol: true },
        
        { regex: /(\{)(.+?)([\:=])(.+?)(\})/,
          token: ["tag", "variable", "operator", "string", "tag"] },
        { regex: /(\[)(ip|lg|sm|ps|ng\/)?(.+?)(\])/,
          token: ["tag", "variable", "string", "tag"] },

        { regex: /<<.+?>>/, token: "link" },
        { regex: /\{n\}/, token: "variable" },
        { regex: /([ ]+)?(\t)([ ]+)?/, token: ["error", null, "error"] },
        
        { regex: /문맥상|의미상/, token: "atom" },
        { regex: /ㆍ|,|\.|!|\?/, token: "operator" }

        

    ],
      // The multi-line comment state.
    comment: [
        {regex: /.*?\*\//, token: "comment", next: "start"},
        {regex: /.*/, token: "comment"}
    ],
      // The meta property contains global information about the mode. It
      // can contain properties like lineComment, which are supported by
      // all modes, and also directives like dontIndentStates, which are
      // specific to simple modes.
    meta: {
        dontIndentStates: ["comment"],
        lineComment: "//"
    }
});