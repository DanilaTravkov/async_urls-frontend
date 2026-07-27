import { JobStatus } from "@/api/jobs.api";

export function isJobTerminal(status: JobStatus) {
    return (
        status === JobStatus.Completed ||
        status === JobStatus.Cancelled ||
        status === JobStatus.Failed
    )
}