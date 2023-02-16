import * as fs from "fs";

interface JournalEntry {
    text: string;
    photos: any[];
    isAllDay: boolean;
    uuid: string;
    modifiedDate: string;
    richText: string;
    timeZone: string;
    creationOSName: string;
    creationOSVersion: string;
    tags: string[];
    creationDate: string;
    editingTime: number;
    isPinned: boolean;
    creationDevice: string;
    creationDeviceType: string;
    duration: number;
    starred: boolean;
    creationDeviceModel: string;
}

const data = fs.readFileSync("./podcasts.json", "utf8");

const journal = JSON.parse(data) as {
    entries: JournalEntry[];
    metadata: {};
};

const entries = journal.entries;

console.log(JSON.parse(entries[20].richText));
