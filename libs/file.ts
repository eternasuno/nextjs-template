export const exist = async (path: string) => {
  try {
    await Deno.stat(path);
    console.info('file exists.', path);

    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
};

export const createReadableStream = (
  path: string,
  start: number,
  end: number,
  bufferSize = 8 * 1024 * 1024, // 8 MB buffer size
) => {
  let offset = start;
  let file: Deno.FsFile;

  return new ReadableStream<Uint8Array>({
    start: async () => {
      offset = start;
      file = await Deno.open(path, { read: true });
    },
    pull: async (controller) => {
      const chunkSize = end - offset + 1;
      if (chunkSize <= 0) {
        controller.close();

        return;
      }

      const buffer = new Uint8Array(Math.min(bufferSize, chunkSize));
      await file.seek(offset, Deno.SeekMode.Start);
      const readSize = await file.read(buffer);
      if (!readSize) {
        controller.close();

        return;
      }

      offset += readSize;
      controller.enqueue(buffer.subarray(0, readSize));
      if (offset > end) {
        controller.close();
      }
    },
    cancel: () => file.close(),
  });
};

export const makeTempDir = async () => {
  const envTempDir = Deno.env.get('TEMP_DIR');
  if (envTempDir) {
    return envTempDir;
  }

  const tempDir = await Deno.makeTempDir();
  Deno.env.set('TEMP_DIR', tempDir);

  return tempDir;
};
