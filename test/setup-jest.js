import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import fetch from 'jest-fetch-mock'
import LocalStorageMock from './__mocks__/LocalStorageMock'

global.fetch = fetch
global.localStorage = new LocalStorageMock()

Enzyme.configure({ adapter: new Adapter() })
