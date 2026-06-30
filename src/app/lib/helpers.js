import {ValidateFile} from "@/schemas/JobSchema.js";

export const stringify_date = (date, format = 1) => {
    const now = date? new Date(parseInt(date)) : new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if(format === 1) {
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } else if(format === 2) {
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
};

export const parse_date = (dateString) => new Date(dateString).getTime();

export const isAllowedFile = (file) => {
    const typeOk = ValidateFile.safeParse(file);
    return typeOk.success;
}

export const sanitizeSegment = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '');
