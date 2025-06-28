import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, View, ActivityIndicator, Animated, Easing, Platform } from "react-native";
import * as FileSystem from "expo-file-system";

export function getImgXtension(uri) {
  var basename = uri.split(/[\\/]/).pop();
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
}

export async function findImageInCache(uri) {
  try {
    let info = await FileSystem.getInfoAsync(uri);
    return { ...info, err: false };
  } catch (error) {
    return {
      exists: false,
      err: true,
      msg: error,
    };
  }
}

export async function cacheImage(uri, cacheUri, callback) {
  try {
    const downloadImage = FileSystem.createDownloadResumable(
      uri,
      cacheUri,
      {},
      callback
    );

    const downloaded = await downloadImage.downloadAsync();

    return {
      cached: true,
      err: false,
      path: downloaded.uri,
    };
  } catch (error) {

    return {
      cached: false,
      err: true,
      msg: error,
    };
  }
}

// Helper to get width/height from style prop
function getDimensionsFromStyle(style) {
  if (!style) return {};
  if (Array.isArray(style)) {
    // Merge all style objects
    style = Object.assign({}, ...style);
  }
  const width = typeof style.width === 'number' ? style.width : undefined;
  const height = typeof style.height === 'number' ? style.height : undefined;
  return { width, height };
}

function getImgixUrl(uri, style) {
  // Only rewrite if not already an imgix url
  if (!uri) return uri;
  if (uri.startsWith('https://shoofi.imgix.net/')) return uri;
  // Remove any leading slashes
  let cleanUri = uri.replace(/^https?:\/\//, '').replace(/^shoofi.imgix.net\//, '');
  // Remove DigitalOcean Spaces domain if present
  cleanUri = cleanUri.replace(/^shoofi-spaces\.fra1\.cdn\.digitaloceanspaces\.com\//, '');
  let url = `https://shoofi.imgix.net/${cleanUri}`;
  const { width, height } = getDimensionsFromStyle(style);
  const params = [];
  if (width) params.push(`w=${Math.round(width)}`);
  if (height) params.push(`h=${Math.round(height)}`);
  if (params.length) url += `?${params.join('&')}`;
  return url + `?w=600&h=300&auto=format&fit=max`;
}

const CustomFastImage = (props) => {
  const {
    source: { uri },
    cacheKey,
    style,
    resizeMode,
    description
  } = props;
  const isMounted = useRef(true);
  const [imgUri, setUri] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Helper to get a blurred imgix url
  function getBlurUrl(url) {
    if (!url) return url;
    // If url already has query params, append with &
    if (url.includes('?')) return url + '&blur=80';
    return url + '?blur=80';
  }

  useEffect(() => {
    setLoaded(false);
  }, [imgUri]);

  useEffect(() => {
    async function loadImg() {
      let imgXt = getImgXtension(uri);
      if (!imgXt || !imgXt.length) {
        return;
      }
      // Use imgix for all images
      const imgixUrl = getImgixUrl(uri, style);
      setUri(imgixUrl);
    }
    loadImg();
    return () => { isMounted.current = false; };
  }, [uri, style]);

  const blurUrl = imgUri ? getBlurUrl(imgUri) : null;

  return (
    <View style={{ position: 'relative', ...style }}>
      {/* Blurred background */}
      {blurUrl && !loaded && (
        <Image
          source={{ uri: blurUrl }}
          style={[style, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }]}
          resizeMode={resizeMode}
          blurRadius={Platform.OS === 'android' ? 1 : 0} // iOS ignores blurRadius for remote images
          accessibilityLabel={description}
        />
      )}
      {/* Main image */}
      {imgUri ? (
        <Image
          source={{ uri: imgUri }}
          style={[style, { zIndex: 2 }]}
          resizeMode={resizeMode}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          accessibilityLabel={description}
        />
      ) : null}
        </View>
  );
};
export default CustomFastImage;