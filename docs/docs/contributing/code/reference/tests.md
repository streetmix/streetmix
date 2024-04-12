# Tests

Tests are extremely important to the health and stability of Streetmix. We have established some systems and processes to help ensure the ongoing reliability of our platform.

We do not have a strict test-driven development (TDD) methodology, although individual engineers may use this approach if that's the development pattern they are most comfortable with. Also, while we do measure code coverage, our goal is not necessarily to reach 100%. We're looking for "enough" coverage to have confidence that new features or refactoring will not create new bugs, which can be more of a subjective approach. As Guillermo Rauch says, ["Write tests. Not too many. Mostly integration."](https://twitter.com/rauchg/status/807626710350839808)

:::info For context...

We did not have _any_ test infrastructure in the early phases of Streetmix. Tests have been added over time and are constantly improving. This document reflects our current thoughts about _how_ we should test, but you'll find lots of moments in the codebase where tests are incomplete or non-existent. We could always use some help with writing tests!

:::

## Running tests locally {#running-tests}

When testing in a local development environment, only [linting](#linting) and [unit tests](#unit-tests) are run.

```shell-session
npm test
```

Full integration tests happen in our continuous integration infrastructure. You're not required to run this locally, but if you'd like, you can do so with this command.

```shell-session
npm cypress:run
```

## Unit and integration tests {#unit-tests}

Our primary test framework is the [Vitest](https://vitest.dev/) test runner with [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro). (These do not do the same thing and are not interchangeable; these two systems work closely together to provide a full unit and integration test environment.) See the list of resources below, which fully document why and how we use these.

Our goal is to be as close as possible to "industry best practice" in order to simplify our understanding and comprehension of tests. _Please do not do anything exotic in these tests._

Front-end unit and integration tests are placed in a `__tests__` folder in the same directory as the module being tested. Test modules should be named `filename.test.js`.

### Integration tests are preferred over unit tests.

Whenever you're writing boilerplate tests, consider writing an integration test rather than an unit test. A good way to know when you should introduce an integration test is when you need to mock a lot of modules in order to test something in isolation. This is typically a sign of side effects, and we'll have greater confidence with an integration test.

This is especially the case with Redux-related actions. You shouldn't need to write a test to see if the Redux store has changed. (We already have standard, boilerplate unit tests for the store itself.) Instead, write an integration test, where instead of testing the action in isolation, test for the end result of the action.

### Component testing

Many of our React components use Redux and react-intl, which are required in the component's context to render properly. If a component has either (or both) in its context, use the helper functions in `./test/helpers/` which wrap React Testing Library's `render()` with mock `<Provider />` and `<IntlProvider />` components.

### Snapshot testing

Snapshots should be used with caution. They tend to break, and developers tend to update them without examining why a snapshot might have changed unexpectedly. Please be careful when snapshots fail and when to add new ones.

Snapshots are good when you test different results, like error messages. Take a look at `./assets/scripts/app/__tests__/StreetEditable.test.js` for an example how snapshots can be used with error messages.

### Mocks

Be aware of mocks. A few files and functions are mocked globally. For example `load_resources` is mocked globally and if you need to use that file in your tests/components be sure to check the mock. Otherwise use `jest.mock` to mock modules, classes, etc.

**Resources**

- [Introducing the react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library) [Kent C. Dodds] _(Why we use RTL, instead of Enzyme.)_
- [How to use React Testing Library Tutorial](https://www.robinwieruch.de/react-testing-library) [Robin Wieruch] _(Start here for the basics.)_
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) [Kent C. Dodds]

## End-to-end tests {#e2e-tests}

We use [Cypress](https://www.cypress.io/), a modern framework for end-to-end testing, to make writing and running our end-to-end tests easier. We currently use it sparingly. We do eventually want more tests to exist in Cypress, when appropriate, and can replace the unit or integration tests that end-to-end tests can cover.

Cypress only runs in [our automated continuous integration test environment](#continuous-integration) by default, but can also be run locally:

```shell-session
npm run cypress:run
```

## Linting {#linting}

We use [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/) to lint JavaScript and CSS, respectively. There is a commit hook that automatically runs the linter on each commit. If the lint fails, you will need to fix your code and try your commit again, or force it to ignore the lint errors. For more information, see the [Code styleguide](../styleguide).

We also use [Prettier](https://github.com/prettier/prettier) to automatically format code in a standardized way. It will only run on changed files.

## Type safety

JavaScript is notoriously not type safe: you may pass any type of object or JavaScript primitive to any function or method, which may not be able to handle them. Or you may write a function that returns values of different types, and the calling script wasn't expecting that return value. Various attempts to introduce type safety on top of JavaScript have entered the ecosystem, and here's how we use these tools.

### PropTypes (React)

[PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html) is a runtime typechecking library used for React development. Because it is a runtime checker, PropTypes will only throw errors in the console when running in the browser or in test suites. (The PropTypes library is not compiled into production code.)

We currently enforce using PropTypes for React components in development. This means that React components must declare all of its props and what types of values that prop should be. The benefit of this approach is that React components self-document what props it accepts. Sometimes, a prop can be overloaded with multiple types, but this is generally discouraged if you can avoid it.

### TypeScript

[TypeScript](https://www.typescriptlang.org/) is an extension of the JavaScript language that allows types to be checked statically (that is, reason about whether the right types are being passed around, without having to run the code itself). It's been [growing steadily in popularity](https://2018.stateofjs.com/javascript-flavors/typescript/) over the past few years.

We have experimented with TypeScript, but we've not fully adopted it into Streetmix. Because we already compile code with Babel, adopting TypeScript piecemeal is doable. However, we have not yet run into a situation where we absolutely _need_ TypeScript. That being said, if and when a good case can be made for adopting it, we will likely jump on board. If a migration to TypeScript occurs in React components, it will supercede using PropTypes.

## Device and browser testing

We do not currently implement device or browser testing, but this is on our to-do list. We have a [Browserstack](https://www.browserstack.com/) account for this purpose.

## Continuous integration (CI) {#continuous-integration}

We use [GitHub Actions](https://github.com/features/actions) to automatically run tests for every commit and pull request to our repository.

### Skipping CI

CI can be skipped by appending `[skip ci]` to a commit message.

### Automatic deployment

Every commit or merged pull request to the `main` branch that passes CI is automatically deployed to the staging server.

Currently, there is no automatic deployment to the production server. We've noticed that each deploy introduces a small amount of lag while the server software restarts. As a result, we now manually trigger deployments to the production server.

## GitHub checks

In addition to continuous integration, we use some third-party services to keep an eye on code quality and test coverage. These services should be considered "code smell" detectors, but treat them with a grain of salt. They are not required to pass before merging pull requests.

### Codecov

[Codecov](https://codecov.io/gh/streetmix/streetmix) measures [code coverage](https://en.wikipedia.org/wiki/Code_coverage), which is the percentage of code that is covered by at least one test suite. This percentage is a commonly used metric that software projects use to show how complete its test suites are. However, the percentage itself is not necessarily a measurement of test _quality_. As a result, while we strive for higher coverage, 100% is not the goal.

A Codecov review is triggered automatically on every pull request, which allows a reviewer to see at a glance whether a pull request increases or decreases overall code coverage. It fails if a large amount of new code is added without increasing a corresponding amount of test coverage.

Because our test suite coverage is quite low at the moment, it is preferred that all new code and refactored code come with test suite coverage.

## Resources

These additional resources from the developer community help guide our approach to testing. This is not an exhaustive list, and we'll keep updating this over time.

- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests/) [Kent C. Dodds] _(on Guillermo Rauch's tweet.)_
- [JavaScript & Node.js Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices) [Yoni Goldberg]
