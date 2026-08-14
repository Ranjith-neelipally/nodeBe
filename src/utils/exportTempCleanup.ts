import { promises as fs } from "fs";
import path from "path";
import { Response } from "express";

const exportTempDirectory = path.resolve(__dirname, "../../tmp");

export const emptyExportTempDirectory = async () => {
  await fs.mkdir(exportTempDirectory, { recursive: true });
  const entries = await fs.readdir(exportTempDirectory);
  await Promise.all(
    entries.map((entry) =>
      fs.rm(path.join(exportTempDirectory, entry), { recursive: true, force: true }),
    ),
  );
};

export const cleanupExportTempAfterResponse = (res: Response) => {
  let cleanupStarted = false;
  const cleanup = () => {
    if (cleanupStarted) return;
    cleanupStarted = true;
    void emptyExportTempDirectory().catch((error) => {
      console.error("Failed to clean the export temp directory", error);
    });
  };

  res.once("finish", cleanup);
  res.once("close", cleanup);
};
