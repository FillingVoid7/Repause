import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { connectDB } from "@/lib/db";

const fileTreeEntrySchema = new Schema(
  {
    path: { type: String, required: true },
    type: { type: String, enum: ["blob", "tree"], required: true },
    size: { type: Number },
  },
  { _id: false },
);

const commitMetadataSchema = new Schema(
  {
    sha: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    repoUrl: { type: String, required: true },
    repoOwner: { type: String, required: true },
    repoName: { type: String, required: true },
    defaultBranch: { type: String, default: "main" },
    readme: { type: String, default: "" },
    languages: { type: Map, of: Number, default: {} },
    fileTree: { type: [fileTreeEntrySchema], default: [] },
    commitsMetadata: { type: [commitMetadataSchema], default: [] },
    narrative: {
      elevatorPitch: { type: String, default: "" },
      star: { type: String, default: "" },
      tradeoffs: { type: String, default: "" },
      technicalDebt: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["ingesting", "ready", "failed"],
      default: "ready",
    },
    scrapeError: { type: String },
  },
  { timestamps: true, collection: "projects" },
);

projectSchema.index({ userId: 1, repoOwner: 1, repoName: 1 }, { unique: true });

export type ProjectDocument = InferSchemaType<typeof projectSchema> & {
  _id: mongoose.Types.ObjectId;
};

type ProjectModel = Model<ProjectDocument>;

export async function getProjectModel(): Promise<ProjectModel> {
  await connectDB();

  return (
    (mongoose.models.Project as ProjectModel | undefined) ??
    mongoose.model<ProjectDocument>("Project", projectSchema)
  );
}

// User Schema - for storing user profile and preferences
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    image: { type: String },
    emailVerified: { type: Date },
  },
  { timestamps: true, collection: "user" },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

type UserModel = Model<UserDocument>;

export async function getUserModel(): Promise<UserModel> {
  await connectDB();

  return (
    (mongoose.models.User as UserModel | undefined) ??
    mongoose.model<UserDocument>("User", userSchema)
  );
}
