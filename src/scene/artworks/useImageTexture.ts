import { useEffect, useRef, useState } from "react";
import { SRGBColorSpace, Texture, TextureLoader } from "three";

/**
 * Loads an image texture from a URL, keeping the previous texture visible
 * until the new one is ready (no flash on progressive hi-res swaps) and
 * disposing replaced/unmounted textures.
 */
export function useImageTexture(url: string | undefined): {
  texture: Texture | null;
  aspect: number | null;
} {
  const [state, setState] = useState<{
    texture: Texture | null;
    aspect: number | null;
  }>({ texture: null, aspect: null });
  const currentRef = useRef<Texture | null>(null);

  useEffect(() => {
    if (!url) {
      // Room deactivated (player moved away): free the GPU memory
      currentRef.current?.dispose();
      currentRef.current = null;
      setState({ texture: null, aspect: null });
      return;
    }
    let cancelled = false;
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = 8;
        const image = texture.image as { width: number; height: number };
        currentRef.current?.dispose();
        currentRef.current = texture;
        setState({ texture, aspect: image.width / image.height });
      },
      undefined,
      () => {
        // Load error: keep whatever we had (placeholder or previous res)
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(
    () => () => {
      currentRef.current?.dispose();
      currentRef.current = null;
    },
    [],
  );

  return state;
}
