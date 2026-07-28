import { JobStatus, UrlStatus, type JobDetails } from "@/api/jobs.api";

export function isJobTerminal(status: JobStatus) {
    return (
        status === JobStatus.Completed ||
        status === JobStatus.Cancelled ||
        status === JobStatus.Failed
    )
}

export function shouldPollStop(details: JobDetails) {
    if (!isJobTerminal(details.status)) {
        return false
    }

    if (details.status !== JobStatus.Cancelled) {
        return true
    }

    const hasUnfinishedItems = details.items.some(
        (item) => 
            item.status === UrlStatus.Pending ||
            item.status === UrlStatus.InProgress
    )

    return !hasUnfinishedItems
}