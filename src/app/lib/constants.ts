export const STATUSES = [
    'Applied',
    'Interview',
    'Offer',
    'Draft',
    'No Response',
    'Rejected'
];

export interface JobPosting {
    title?: string;
    company?: string;
    location?: string;
    salary?: string;
    description?: string;
    applyUrl?: string;
    remote?: boolean;
}

export abstract class JobExtractor {
    self:string
    protected constructor() {
        console.log("This is a constructor for" + this.self)
    }
    abstract canHandle(url: URL): boolean;
    abstract extract(html: string, url: URL): Promise<JobPosting>;
}