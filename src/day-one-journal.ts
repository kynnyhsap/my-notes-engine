export interface DayOneJournal {
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
    entries: DayOneJournal[];
    metadata: {};
}

export interface RichText {
    meta: {};
    contents: RichTextNode[];
}

export interface RichTextNode {
    text?: string;
    attributes?: RichTextAttributes;
    embeddedObjects?: RichTextEmbeddedObject[];
}

interface RichTextAttributes {
    line?: {
        header?: number;
        indentLevel?: number;
        quote?: boolean;
        identifier?: string;
    };
    linkURL?: string;
    bold?: boolean;
}

interface RichTextEmbeddedObject {
    type: string;
    // ...
}
