/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TraceSummaryRequest } from '../models/TraceSummaryRequest';
import type { TraceSummaryResponse } from '../models/TraceSummaryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TracesService {
    /**
     * Summarize Traces
     * Fetch recent traces from MLflow and generate an AI-powered summary.
     * @param requestBody
     * @returns TraceSummaryResponse Successful Response
     * @throws ApiError
     */
    public static summarizeTracesApiTracesSummarizePost(
        requestBody: TraceSummaryRequest,
    ): CancelablePromise<TraceSummaryResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/traces/summarize',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
