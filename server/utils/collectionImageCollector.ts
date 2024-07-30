import fs from "fs";
import https from "https";

const BASE_ID = "QmcQvTWn4cbUsKqxWgEiHBMyauvr6rJLPgRAhU7gYaoAn6";

const BASE_URLS = [
  `https://ipfs.io/ipfs/${BASE_ID}`,
  `https://bafybeigrdo7tu2wnmrofvjhaf2sotyt7bfqtbakne3xcrzatnlkup7is3m.ipfs.dweb.link`,
  // `https://dweb.link/ipfs/${BASE_ID}`,
  // `https://cloudflare-ipfs.com/ipfs/${BASE_ID}`,
  // `https://ipfs.infura.io/ipfs/${BASE_ID}`,
  // `https://gateway.pinata.cloud/ipfs/${BASE_ID}`,
  // `https://cf-ipfs.com/ipfs/${BASE_ID}`,
  `https://gateway.ipfs.io/ipfs/${BASE_ID}`,
  `https://10.via0.com/ipfs/${BASE_ID}`,
  // `https://ipfs.cf-ipfs.com/ipfs/${BASE_ID}`,
];

const MAX_IMAGES = 10000;

const delayTime = (time: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

function isValidPNG(buffer: Buffer): boolean {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length < 8) return false;
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== pngSignature[i]) return false;
  }
  return true;
}

async function downloadImage(url: string, dest: string) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download image - ${url}. Status code: ${response.statusCode}, Status message: ${response.statusMessage}`
            )
          );
          return;
        }

        let imageData: Buffer[] = [];
        response.on("data", (chunk) => {
          imageData.push(chunk);
        });

        response.on("end", () => {
          const completeImage = Buffer.concat(imageData);
          if (!isValidPNG(completeImage)) {
            reject(new Error("Invalid PNG image."));
            return;
          }
          fs.writeFileSync(dest, completeImage);
          resolve(true);
        });
        response.on("error", (err) => {
          return err;
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {}); // Delete the failed image
        reject(err);
      });
  });
}

const retryDownloadRecursive = async (i: number) => {
  const base = BASE_URLS[Math.floor(Math.random() * BASE_URLS.length)];
  const imageUrl = `${base}/${i}.png`;
  const dest = `./images/${i}.png`;
  try {
    await downloadImage(imageUrl, dest);
    console.log(`Downloaded image ${i}`);
    await delayTime(
      Math.floor(Math.random() * 3000) + Math.floor(Math.random() * 1000)
    );
  } catch (error) {
    console.log(`Failed to download image ${i}. Retrying...`);
    console.log(error);
    await delayTime(5000);
    await retryDownloadRecursive(i);
  }
};

async function main() {
  // Check if the images directory exists, if not, create it
  if (!fs.existsSync("./images/")) {
    fs.mkdirSync("./images/");
  }

  // Get the highest numbered image in the directory
  const files = fs.readdirSync("./images/");
  const highestNumberedFile = files.reduce((max, file) => {
    const number = parseInt(file.split(".")[0], 10);
    return number > max ? number : max;
  }, -1);

  // Create an array of all image numbers from 0 to highestNumberedFile
  const allImageNumbers = Array.from({ length: highestNumberedFile + 1 }, (_, i) => i);

  // Filter out the numbers that already have corresponding images
  const existingImageNumbers = files.map(file => parseInt(file.split(".")[0], 10));
  const missingImageNumbers = allImageNumbers.filter(num => !existingImageNumbers.includes(num));

  // Download the missing images
  for (let i of missingImageNumbers) {
    await retryDownloadRecursive(i);
  }

  const startFrom = highestNumberedFile + 1;

  for (let i = startFrom; i < MAX_IMAGES; i++) {
    await retryDownloadRecursive(i);
  }

  console.log("Done!");
}


main().catch((error) => {
  console.error("An error occurred:", error);
});
