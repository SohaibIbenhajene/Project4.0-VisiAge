import React, { useEffect, useState } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { REACT_APP_SAS_TOKEN } from '@env';
import { fetchBlobUrl } from '../../api/api';
import { useTheme } from '@rneui/themed';

export default function VideoCard({ url }) {
  const video = React.useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // fetch the video from the blob
    async function fetchVideo() {
      try {
        setLoading(true);
        const data = await fetchBlobUrl(url, REACT_APP_SAS_TOKEN);
        setVideoFile(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();

    // Check if SAS token is available
    if (!REACT_APP_SAS_TOKEN) {
      console.error('SAS token is not defined. Make sure to set REACT_APP_SAS_TOKEN in your environment.');
      return;
    }
  }, []);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    video: {
      width: 400,
      aspectRatio: 16 / 9,
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white,
    },
  });

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      )}

      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: url ? videoFile : 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
      />
    </View>
  );
}
