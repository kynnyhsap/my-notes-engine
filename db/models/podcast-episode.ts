import { Document, Types, Schema, model } from "mongoose";

interface IPodcastEpisodeDoc extends Document {
    podcastId: Types.ObjectId;

    title: string;

    url: string;

    summary: string;

    showNotesHtml: string;

    notes: string[];
}

const podcastEpisodeSchema = new Schema<IPodcastEpisodeDoc>({
    podcastId: { type: Schema.Types.ObjectId, required: true },

    title: { type: String, required: true },

    url: { type: String, required: true },

    summary: { type: String },

    showNotesHtml: { type: String },
});

export const PodcastEpisodeModel = model<IPodcastEpisodeDoc>(
    "PodcastEpisode",
    podcastEpisodeSchema
);
