import './App.css'
import Geotagging from './components/map'
import { ChakraProvider } from '@chakra-ui/react'

function App() {

  return (
    <>
      <ChakraProvider>
        <Geotagging />
      </ChakraProvider>
    </>
  )
}

export default App
