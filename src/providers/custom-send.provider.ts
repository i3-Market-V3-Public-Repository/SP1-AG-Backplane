/*
#  Copyright 2020-2022 i3-MARKET Consortium:
#
#  ATHENS UNIVERSITY OF ECONOMICS AND BUSINESS - RESEARCH CENTER
#  ATOS SPAIN SA
#  EUROPEAN DIGITAL SME ALLIANCE
#  GFT ITALIA SRL
#  GUARDTIME OU
#  HOP UBIQUITOUS SL
#  IBM RESEARCH GMBH
#  IDEMIA FRANCE
#  SIEMENS AKTIENGESELLSCHAFT
#  SIEMENS SRL
#  TELESTO TECHNOLOGIES PLIROFORIKIS KAI EPIKOINONION EPE
#  UNIVERSITAT POLITECNICA DE CATALUNYA
#  UNPARALLEL INNOVATION LDA
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
*/

import {Send, Response, OperationRetval} from '@loopback/rest';
import {Provider, inject, injectable, BindingScope} from '@loopback/core';
import {writeResultToResponse, RestBindings, Request} from '@loopback/rest';

@injectable({scope: BindingScope.SINGLETON})
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
        response.end(CustomSendProvider.parseResult(result.value));
        return;
      }
    }
    writeResultToResponse(response, result); //default behaviour
  }

  private static parseResult(result: OperationRetval){
    let res;
    switch (typeof result) {
      case 'object':
      case 'boolean':
      case 'number':
          res = JSON.stringify(result);
        break;
      default:
        res = result.toString();
        break;
    }
    return res;
  }
}