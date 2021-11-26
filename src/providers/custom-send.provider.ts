import {Send, Response, OperationRetval} from '@loopback/rest';
import {Provider, inject} from '@loopback/core';
import {writeResultToResponse, RestBindings, Request} from '@loopback/rest';


export class CustomSendProvider implements Provider<Send> {
  // In this example, the injection key for formatter is simple
  constructor(
    @inject(RestBindings.Http.REQUEST) public request: Request,
  ) {}

  value() {
    // Use the lambda syntax to preserve the "this" scope for future calls!
    return (response: Response, result: OperationRetval) => {
      this.action(response, result);
    };
  }
  /**
   * Propagate the contentType header in openApiConnector responses
   * @param response - The response object used to reply to the  client.
   * @param result - The result of the operation carried out by the controller's
   * handling function.
   */
  action(response: Response, result: OperationRetval) {
    if (result?.isOpenApi) {
      const contentType = result.headers['content-type'];
      if (contentType != null && contentType.length > 0){
        response.setHeader('Content-Type', contentType);
        response.end(result.value);
        return;
      }
    }
    writeResultToResponse(response, result); //default behaviour
  }
}