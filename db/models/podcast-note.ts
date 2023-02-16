import { Document, Types, Schema, model } from "mongoose";

interface IPodcastNoteDoc extends Document {
    text: string;

    timestamp: number;

    podcastEpisodeId: Types.ObjectId;

    podcastId: Types.ObjectId;
}

const podcastNoteSchema = new Schema<IPodcastNoteDoc>({
    text: { type: String, required: true },

    timestamp: { type: Number, required: true },

    podcastEpisodeId: { type: Schema.Types.ObjectId, required: true },

    podcastId: { type: Schema.Types.ObjectId, required: true },
});

export const PodcastNoteModel = model<IPodcastNoteDoc>(
    "PodcastNote",
    podcastNoteSchema
);
