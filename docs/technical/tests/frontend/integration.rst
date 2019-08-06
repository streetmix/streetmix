Integration testing
=======================

Integration tests help to test a specifix flow of information.  

What integration tests to write?
----------------------------------------

Whenever you're writing boilerplate tests consider writing an integration test rather than an unit test.  
Especially Redux-related actions and reducers are a good opportunity to use integration tests. 
Another good point to introduce an integration test is for a test where you need to mock a lot of modules to test in isolation. This is typicaly a sign of a lot of side effects that should be tested with an integration test.

Redux
--------------------------

Redux actions and reducers are mostly boilerplate code and it is tedious to write unit tests for them. They do not serve a specific purpose since you're testing the framework more than you're testing your code.  
There are instances where you have more business logic in your actions, typically for asynchronous actions. The best way we found to test those actions is to use a Integration test approach. 
Instead of testing the action in isolation, we test the end result of the action. Since actions are the way to change the store, we can use that to make assumptions on the end result. 

Take a look in :file:`./test/helpers/` where you find a helper for creating the store.

