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

const flashcardSchema = new Schema(
  {
    category: {
      type: String,
      enum: [
        "decision",
        "tradeoff",
        "debt",
        "bottleneck",
        "alternative",
        "concept",
      ],
    },
    front: { type: String },
    back: { type: String },
  },
  { _id: false },
);

const flowNodeSchema = new Schema(
  {
    id: { type: String },
    label: { type: String },
    description: { type: String },
  },
  { _id: false },
);

const flowEdgeSchema = new Schema(
  {
    from: { type: String },
    to: { type: String },
    label: { type: String },
  },
  { _id: false },
);

const engineeringDecisionSchema = new Schema(
  {
    decision: { type: String },
    whyChosen: { type: String },
    alternativeConsidered: { type: String },
    tradeoff: { type: String },
  },
  { _id: false },
);

const failureScenarioSchema = new Schema(
  {
    scenario: { type: String },
    handling: { type: String },
  },
  { _id: false },
);

const deepDiveQuestionSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["architecture", "scalability", "database", "ai", "security"],
    },
    question: { type: String },
    talkingPoints: { type: String },
  },
  { _id: false },
);

const reviewFieldsSchema = {
  contribution: { type: String, default: "" },
  targetRole: { type: String, default: "" },
  companyTier: { type: String, default: "" },
  jobDescription: { type: String, default: "" },
  // Legacy: no longer collected or sent to the model, kept for old documents.
  stackDescription: { type: String, default: "" },
  additionalContext: { type: String, default: "" },
};

const narrativeFieldsSchema = {
  pitchSummary: { type: String, default: "" },
  star: {
    situation: { type: String, default: "" },
    task: { type: String, default: "" },
    action: { type: String, default: "" },
    result: { type: String, default: "" },
  },
  flashcards: { type: [flashcardSchema], default: [] },
  architectureFlow: {
    nodes: { type: [flowNodeSchema], default: [] },
    edges: { type: [flowEdgeSchema], default: [] },
  },
  engineeringDecisions: { type: [engineeringDecisionSchema], default: [] },
  failureScenarios: { type: [failureScenarioSchema], default: [] },
  deepDiveQuestions: { type: [deepDiveQuestionSchema], default: [] },
  gaps: { type: [String], default: [] },
};

const narrativeHistoryEntrySchema = new Schema(
  {
    id: { type: String, required: true },
    contextHash: { type: String, default: "" },
    review: reviewFieldsSchema,
    narrative: narrativeFieldsSchema,
    createdAt: { type: Date, default: Date.now },
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
    review: reviewFieldsSchema,
    narrative: narrativeFieldsSchema,
    narrativeContextHash: { type: String },
    narrativeReviewSnapshot: reviewFieldsSchema,
    narrativeHistory: { type: [narrativeHistoryEntrySchema], default: [] },
    narrativeStatus: {
      type: String,
      enum: ["pending", "generating", "ready", "failed"],
      default: "pending",
    },
    narrativeError: { type: String },
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
