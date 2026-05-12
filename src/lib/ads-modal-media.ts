/** Mirrors backend `ADS_MODAL_MEDIA_RULES` / ads-modal-media-validation. */

export const ADS_MODAL_MEDIA_RULES = {
  maxSizeBytes: 1 * 1024 * 1024,
  allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg'] as const,
  targetAspectRatioLabel: '4:5',
  targetDimensionsExample: '1200×1500',
  aspectRatioTolerance: 0.01,
  targetRatio: 4 / 5
};

const EXTENSION_BY_MIME: Record<string, readonly string[]> = {
  'image/webp': ['.webp'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg']
};

export function validateAdsModalFileBasics(file: File): string | null {
  const mime = (file.type || '').toLowerCase();

  if (
    !ADS_MODAL_MEDIA_RULES.allowedMimeTypes.includes(
      mime as (typeof ADS_MODAL_MEDIA_RULES.allowedMimeTypes)[number]
    )
  ) {
    return 'Use a .webp, .png, or .jpeg image.';
  }

  const allowedExt = EXTENSION_BY_MIME[mime];

  if (!allowedExt) {
    return 'Invalid image type.';
  }

  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';

  if (!allowedExt.includes(ext as '.webp' | '.png' | '.jpg' | '.jpeg')) {
    return `File extension must match type (${allowedExt.join(', ')}).`;
  }

  if (file.size > ADS_MODAL_MEDIA_RULES.maxSizeBytes) {
    return 'File must be 1 MB or smaller.';
  }

  if (file.size <= 0) {
    return 'File is empty.';
  }

  return null;
}

export function validateAdsModalDimensions(width: number, height: number): string | null {
  if (!width || !height) {
    return 'Could not read image dimensions.';
  }

  const ratio = width / height;

  if (
    Math.abs(ratio - ADS_MODAL_MEDIA_RULES.targetRatio) > ADS_MODAL_MEDIA_RULES.aspectRatioTolerance
  ) {
    return `Use a ${ADS_MODAL_MEDIA_RULES.targetAspectRatioLabel} image (recommended ${ADS_MODAL_MEDIA_RULES.targetDimensionsExample} px).`;
  }

  return null;
}

export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);

      reject(new Error('Could not read image'));
    };

    img.src = url;
  });
}

export async function validateAdsModalFile(file: File): Promise<void> {
  const basic = validateAdsModalFileBasics(file);

  if (basic) {
    throw new Error(basic);
  }

  const { width, height } = await readImageDimensions(file);

  const dim = validateAdsModalDimensions(width, height);

  if (dim) {
    throw new Error(dim);
  }
}

export function isAdsModalActive(params: { isActive: boolean }): boolean {
  return params.isActive;
}
