import React from 'react'

/**
 * react-markdown is an ESM-only package, which Jest has brittle support
 * for. Since we don't need to test react-markdown internals or output,
 * mocking the package is fine.
 */
// eslint-disable-next-line react/prop-types
function ReactMarkdown ({ children }) {
  return <>{children}</>
}

export default ReactMarkdown
