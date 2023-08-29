/**
 * Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package org.chromium.chrome.browser.playlist.download;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.text.TextUtils;
import android.util.Pair;

import com.brave.playlist.util.HLSParsingUtil;
import com.brave.playlist.util.MediaUtils;
import com.google.android.exoplayer2.source.hls.playlist.HlsMediaPlaylist.Segment;
import com.google.android.exoplayer2.util.UriUtil;

import org.chromium.base.ContextUtils;
import org.chromium.base.Log;
import org.chromium.mojo.system.MojoException;
import org.chromium.playlist.mojom.PlaylistService;
import org.chromium.playlist.mojom.PlaylistStreamingObserver;

import java.io.File;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Random;

public class DownloadUtils {
    private static final String GET_METHOD = "GET";
    private static final String TAG = "Playlist.DownloadUtils";
    public interface PlaylistDownloadDelegate {
        default void onDownloadStarted(String url, long contentLength) {}
        default void onDownloadProgress(long totalBytes, long downloadedSofar) {}
        default void onDownloadCompleted(String filePath) {}
    }

    private static long totalBytesForHls = 0l;
    private static long receivedBytesForHls = 0l;

    private static String mediaPath =
            MediaUtils.getTempFile(ContextUtils.getApplicationContext()).getAbsolutePath();
    private static String hlsManifestFilePath =
            MediaUtils.getTempManifestFile(ContextUtils.getApplicationContext()).getAbsolutePath();

    public static void downloadFile(PlaylistService playlistService, String parentPath,
            boolean isManifestFile, String url,
            DownloadUtils.PlaylistDownloadDelegate playlistDownloadDelegate) {
        Log.e(TAG, "queryPrompt : " + url);
        // String mediaPath = new
        // File(MediaUtils.getTempFile(ContextUtils.getApplicationContext)).getAbsolutePath() // new
        // File(parentPath, "index.mp4").getAbsolutePath(); String hlsManifestFilePath = new
        // File(MediaUtils.getTempManifestFile(ContextUtils.getApplicationContext)).getAbsolutePath()
        // //new File(parentPath, "index.m3u8").getAbsolutePath();
        Log.e(TAG, "mediaPath : " + mediaPath);
        Log.e(TAG, "hlsManifestFilePath : " + hlsManifestFilePath);
        if (playlistService != null) {
            playlistService.queryPrompt(url, GET_METHOD);
            PlaylistStreamingObserver playlistStreamingObserverImpl =
                    new PlaylistStreamingObserver() {
                        long totalBytes = 0l;
                        long downloadedSofar = 0l;
                        @Override
                        public void onResponseStarted(String url, long contentLength) {
                            totalBytes = contentLength;
                            try {
                                File mediaFile =
                                        new File(isManifestFile ? hlsManifestFilePath : mediaPath);
                                if (mediaFile.exists()) {
                                    mediaFile.delete();
                                }
                                if (!isManifestFile) {
                                    if (playlistDownloadDelegate != null) {
                                        playlistDownloadDelegate.onDownloadStarted(
                                                url, contentLength);
                                    }
                                }
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }

                        @Override
                        public void onDataReceived(byte[] response) {
                            downloadedSofar = downloadedSofar + response.length;
                            try {
                                MediaUtils.writeToFile(
                                        response, isManifestFile ? hlsManifestFilePath : mediaPath);
                                if (!isManifestFile) {
                                    if (playlistDownloadDelegate != null) {
                                        playlistDownloadDelegate.onDownloadProgress(
                                                totalBytes, downloadedSofar);
                                    }
                                }
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }

                        @Override
                        public void onDataCompleted() {
                            try {
                                playlistService.clearObserverForStreaming();
                                if (isManifestFile) {
                                    List<Segment> segments = HLSParsingUtil.getContentSegments(
                                            hlsManifestFilePath, url);
                                    Queue<Segment> segmentsQueue = new LinkedList<Segment>();
                                    totalBytesForHls = 0l;
                                    for (Segment segment : segments) {
                                        Log.e(TAG,
                                                "onDataCompleted : segment Url : " + segment.url);
                                        totalBytesForHls =
                                                totalBytesForHls + segment.byteRangeLength;
                                        segmentsQueue.add(segment);
                                    }
                                    File mediaFile = new File(mediaPath);
                                    if (mediaFile.exists()) {
                                        mediaFile.delete();
                                    }
                                    downalodHLSFile(playlistService, url, segmentsQueue, mediaPath,
                                            playlistDownloadDelegate);
                                    if (playlistDownloadDelegate != null) {
                                        playlistDownloadDelegate.onDownloadStarted(
                                                url, totalBytesForHls);
                                    }
                                } else {
                                    if (playlistDownloadDelegate != null) {
                                        playlistDownloadDelegate.onDownloadCompleted(mediaPath);
                                    }
                                }
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }

                        @Override
                        public void close() {}

                        @Override
                        public void onConnectionError(MojoException e) {}
                    };

            playlistService.addObserverForStreaming(playlistStreamingObserverImpl);
        }
    }

    private static void downalodHLSFile(PlaylistService playlistService, String manifestUrl,
            Queue<Segment> segmentsQueue, String mediaPath,
            DownloadUtils.PlaylistDownloadDelegate playlistDownloadDelegate) {
        if (playlistService != null) {
            Segment segment = segmentsQueue.poll();
            if (segment == null) {
                return;
            }
            Log.e(TAG, "queryPrompt : " + UriUtil.resolve(manifestUrl, segment.url));
            playlistService.queryPrompt(UriUtil.resolve(manifestUrl, segment.url), GET_METHOD);
            PlaylistStreamingObserver playlistStreamingObserverImpl =
                    new PlaylistStreamingObserver() {
                        @Override
                        public void onResponseStarted(String url, long contentLength) {
                            Log.e(TAG, "onResponseStarted : " + url);
                        }

                        @Override
                        public void onDataReceived(byte[] response) {
                            Log.e(TAG, "onDataReceived : ");
                            try {
                                MediaUtils.writeToFile(response, mediaPath);
                                receivedBytesForHls = receivedBytesForHls + response.length;
                                if (playlistDownloadDelegate != null) {
                                    playlistDownloadDelegate.onDownloadProgress(
                                            totalBytesForHls, receivedBytesForHls);
                                }
                            } catch (Exception ex) {
                                ex.printStackTrace();
                                receivedBytesForHls = 0l;
                            }
                        }

                        @Override
                        public void onDataCompleted() {
                            Log.e(TAG, "segment Url onDataCompleted : ");
                            try {
                                playlistService.clearObserverForStreaming();
                                Segment newSegment = segmentsQueue.peek();
                                if (newSegment != null) {
                                    Log.e(TAG, "newSegment : ");
                                    downalodHLSFile(playlistService, manifestUrl, segmentsQueue,
                                            mediaPath, playlistDownloadDelegate);
                                } else {
                                    playlistDownloadDelegate.onDownloadCompleted(mediaPath);
                                }
                            } catch (Exception ex) {
                                ex.printStackTrace();
                                receivedBytesForHls = 0l;
                            }
                        }

                        @Override
                        public void close() {}

                        @Override
                        public void onConnectionError(MojoException e) {}
                    };

            playlistService.addObserverForStreaming(playlistStreamingObserverImpl);
        }
    }
}
