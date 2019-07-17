import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import fetch from 'jest-fetch-mock'
import 'jest-canvas-mock'
import 'jest-date-mock'
import LocalStorageMock from './__mocks__/LocalStorageMock'
import Modernizr from './__mocks__/Modernizr'

global.fetch = fetch
global.localStorage = new LocalStorageMock()
global.Modernizr = Modernizr

Enzyme.configure({ adapter: new Adapter() })
