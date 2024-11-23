"use server";

// Import using ES module syntax
import { ImageAnnotatorClient, protos } from "@google-cloud/vision";
import path from "path";
type IEntityAnnotation = protos.google.cloud.vision.v1.IEntityAnnotation;
import { promises as fs } from "fs";

import { Storage } from "@google-cloud/storage";
import { ReadStream } from "fs";
import { v4 as uuidv4 } from "uuid";

export const fetchApi = async () => {
  console.log("hello");
};

interface ClientOptions {
  apiEndpoint: string;
  [key: string]: string | number | boolean | undefined;
}

// interface TextAnnotation {
//   description: string | null | undefined;
//   // Add other properties if needed
//   boundingPoly?: object;
//   locale?: string;
// }

// Path - questions-textract-abfbb2668d97.json

export async function setEndpoint(): Promise<void> {
  console.log("Starting upload of file to vision api");
  // Specifies the location of the api endpoint
  const clientOptions: ClientOptions = {
    apiEndpoint: "vision.googleapis.com",
  };

  console.log("Starting upload of file to vision api");

  // Creates a client
  const client = new ImageAnnotatorClient(clientOptions);

  try {
    // Performs text detection on the image file
    console.log("Perform client upload");

    // const fs = require("fs").promises;
    const filePath = "gs://pdf-bucket-question-textract/depression-upload"; // path.join(process.cwd(), "resources", "depression.pdf");
    const fileContent = await fs.readFile(filePath);

    const [result] = await client.textDetection({
      image: {
        content: fileContent,
      },
    });

    console.log("Results: ", result);
    // const [result] = await client.textDetection("./resources/depression.pdf");
    const labels: IEntityAnnotation[] = result.textAnnotations || [];
    // const labels: TextAnnotation[] = (result.textAnnotations || []);
    console.log("Text:");
    labels.forEach((label: IEntityAnnotation) =>
      console.log(label.description)
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function annotateImage(): Promise<void> {
  // gs://pdf-bucket-question-textract/depression-upload

  // Creates a client
  const client = new ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // Bucket where the file resides
  const bucketName = "pdf-bucket-question-textract";
  // Path to PDF file within bucket
  const fileName = "depression-upload";
  // The folder to store the results
  const outputPrefix = "results";

  const gcsSourceUri = `gs://${bucketName}/${fileName}`;
  const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

  const inputConfig = {
    // Supported mime_types are: 'application/pdf' and 'image/tiff'
    mimeType: "application/pdf",
    gcsSource: {
      uri: gcsSourceUri,
    },
  };
  const outputConfig = {
    gcsDestination: {
      uri: gcsDestinationUri,
    },
  };
  const features = [
    {
      type: protos.google.cloud.vision.v1.Feature.Type.DOCUMENT_TEXT_DETECTION,
    },
  ];
  const request = {
    requests: [
      {
        inputConfig: inputConfig,
        features: features,
        outputConfig: outputConfig,
      },
    ],
  };

  const [operation] = await client.asyncBatchAnnotateFiles(request);
  const [filesResponse] = await operation.promise();
  const destinationUri =
    filesResponse?.responses?.[0]?.outputConfig?.gcsDestination?.uri;
  console.log("Json saved to: " + destinationUri);
}

// MARK: - Bucket Upload

interface UploadOptions {
  bucketName: string;
  fileName: string;
  filePath?: string;
  fileBuffer?: Buffer;
  fileStream?: ReadStream;
  contentType?: string;
}

export async function uploadTestFileToBucket(): Promise<void> {
  // Using file path
  //   await uploadToBucket({
  //     bucketName: "pdf-bucket-question-textract",
  //     fileName: "depression.pdf", // `${uuidv4()}.pdf`,
  //     filePath: path.join(process.cwd(), "resources", "depression.pdf"),
  //   });

  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // The path to your file to upload
  // const filePath = 'path/to/your/file';

  // The new ID for your GCS file
  const destFileName = "depression-upload";

  // Imports the Google Cloud client library

  // Creates a client
  const storage = new Storage();

  async function uploadFile() {
    const options = {
      destination: destFileName,
      // Optional:
      // Set a generation-match precondition to avoid potential race conditions
      // and data corruptions. The request to upload is aborted if the object's
      // generation number does not match your precondition. For a destination
      // object that does not yet exist, set the ifGenerationMatch precondition to 0
      // If the destination object already exists in your bucket, set instead a
      // generation-match precondition using its generation number.
      // preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
    };
    const filePath = path.join(process.cwd(), "resources", "depression.pdf");
    const bucketName = "pdf-bucket-question-textract";
    await storage.bucket(bucketName).upload(filePath, options);
    console.log(`${filePath} uploaded to ${bucketName}`);
  }

  uploadFile().catch(console.error);
}

async function uploadToBucket({
  bucketName,
  fileName,
  filePath,
  fileBuffer,
  fileStream,
  contentType = "application/pdf",
}: UploadOptions): Promise<string> {
  try {
    console.log("Starting upload option...");
    // Initialize storage
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(fileName);

    // Set upload options
    const uploadOptions = {
      contentType,
      metadata: {
        contentType,
      },
    };

    // Handle different input types
    if (filePath) {
      // Upload from file path
      console.log("Uploading from file path: ", filePath);
      await blob.save(filePath, uploadOptions);
    } else if (fileBuffer) {
      // Upload from buffer
      await blob.save(fileBuffer, uploadOptions);
    } else if (fileStream) {
      // Upload from stream
      await new Promise<void>((resolve, reject) => {
        fileStream
          .pipe(blob.createWriteStream(uploadOptions))
          .on("error", reject)
          .on("finish", resolve);
      });
    } else {
      throw new Error("No file input provided");
    }

    // Generate signed URL (optional)
    const [url] = await blob.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
    });

    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Example usage:
/*
  // Using file path
  await uploadToBucket({
    bucketName: 'my-bucket',
    fileName: 'document.pdf',
    filePath: './path/to/document.pdf'
  });
  
  // Using buffer
  const fileBuffer = Buffer.from('...'); // Your PDF buffer
  await uploadToBucket({
    bucketName: 'my-bucket',
    fileName: 'document.pdf',
    fileBuffer: fileBuffer
  });
  
  // Using stream
  import { createReadStream } from 'fs';
  const fileStream = createReadStream('./path/to/document.pdf');
  await uploadToBucket({
    bucketName: 'my-bucket',
    fileName: 'document.pdf',
    fileStream: fileStream
  });
  */
