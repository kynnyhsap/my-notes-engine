export interface JournalEntry {
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

export interface Journal {
    entries: JournalEntry[];
    metadata: {};
}
