export default function compressImage(file, quality = 0.7, maxWidth = 1280) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
  
        img.onload = () => {
          const canvas = document.createElement("canvas");
  
          let width = img.width;
          let height = img.height;
  
          // resize if too large
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob(
            blob => {
              resolve(blob);
            },
            "image/jpeg",
            quality
          );
        };
  
        img.onerror = reject;
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  }
  