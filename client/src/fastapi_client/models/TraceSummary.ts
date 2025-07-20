/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ToolUsage } from './ToolUsage';
export type TraceSummary = {
    summary_text: string;
    themes: Array<string>;
    errors: Array<string>;
    tools_used: Array<ToolUsage>;
    success_rate: number;
};

