import React from 'react'

import { useMyHook } from 'react-use-asset-loader'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App