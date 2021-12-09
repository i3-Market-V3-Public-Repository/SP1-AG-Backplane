
import {BindingScope, inject, injectable} from '@loopback/core';
import {ErrorWriterOptions} from 'strong-error-handler';
import {LogError, Reject, RejectProvider, RestBindings} from '@loopback/rest';

interface CustomError extends Error{
  name: string;
  message: string;
  stack?: string;
  response?: {
    body?: unknown
  };
  responseBody?: unknown;
}

@injectable({scope: BindingScope.SINGLETON})
export class CustomRejectProvider extends RejectProvider {
  constructor(
    @inject(RestBindings.SequenceActions.LOG_ERROR)
    protected logError: LogError,
    @inject(RestBindings.ERROR_WRITER_OPTIONS, {optional: true})
    protected errorWriterOptions?: ErrorWriterOptions,
  ) {super(logError, errorWriterOptions)}

  value(): Reject {
    return (context, error: Error) => {
      const customError: CustomError = error;
      if (customError.response != null){
        customError.responseBody = customError.response.body;
      }
      this.action(context, customError);
    }
  }

}