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
        default void onDownloadCompleted() {}
    }

    public static void downloadFile(PlaylistService playlistService, boolean isManifestFile,
            String url, DownloadUtils.PlaylistDownloadDelegate playlistDownloadDelegate) {
        Log.e(TAG, "queryPrompt : " + url);
        if (playlistService != null) {
            playlistService.queryPrompt(url, GET_METHOD);
            PlaylistStreamingObserver playlistStreamingObserverImpl =
                    new PlaylistStreamingObserver() {
                        long totalBytes = 0l;
                        long downloadedSofar = 0l;
                        File mediaFile = isManifestFile
                                ? new File(MediaUtils
                                                   .getTempManifestFile(
                                                           ContextUtils.getApplicationContext())
                                                   .getAbsolutePath())
                                : new File(
                                        MediaUtils.getTempFile(ContextUtils.getApplicationContext())
                                                .getAbsolutePath());
                        @Override
                        public void onResponseStarted(String url, long contentLength) {
                            totalBytes = contentLength;
                            try {
                                Log.e(TAG, "onResponseStarted : " + url);
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
                            Log.e(TAG, "onDataReceived : " + response.length);
                            downloadedSofar = downloadedSofar + response.length;
                            try {
                                MediaUtils.writeToFile(response, mediaFile.getAbsolutePath());
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
                            Log.e(TAG, "onDataCompleted : ");
                            try {
                                if (isManifestFile) {
                                    List<Segment> segments = HLSParsingUtil.getContentSegments(
                                            mediaFile.getAbsolutePath(), url);
                                    Queue<Segment> segmentsQueue = new LinkedList<Segment>();
                                    for (Segment segment : segments) {
                                        segmentsQueue.add(segment);
                                    }
                                    downalodHLSFile(playlistService, url, segmentsQueue,
                                            playlistDownloadDelegate);
                                } else {
                                    if (playlistDownloadDelegate != null) {
                                        playlistDownloadDelegate.onDownloadCompleted();
                                    }
                                }
                                playlistService.clearObserverForStreaming();
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
            Queue<Segment> segmentsQueue,
            DownloadUtils.PlaylistDownloadDelegate playlistDownloadDelegate) {
        if (playlistService != null) {
            Segment segment = segmentsQueue.poll();
            if (segment == null) {
                return;
            }
            playlistService.queryPrompt(UriUtil.resolve(manifestUrl, segment.url), GET_METHOD);
            PlaylistStreamingObserver playlistStreamingObserverImpl =
                    new PlaylistStreamingObserver() {
                        @Override
                        public void onResponseStarted(String url, long contentLength) {
                            try {
                                Log.e(TAG, "segment Url : " + segment.url);
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }

                        @Override
                        public void onDataReceived(byte[] response) {
                            try {
                                MediaUtils.writeToFile(response,
                                        MediaUtils.getTempFile(ContextUtils.getApplicationContext())
                                                .getAbsolutePath());
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }

                        @Override
                        public void onDataCompleted() {
                            try {
                                playlistService.clearObserverForStreaming();
                                Segment newSegment = segmentsQueue.poll();
                                if (newSegment != null) {
                                    downalodHLSFile(playlistService, manifestUrl, segmentsQueue);
                                } else {
                                    playlistDownloadDelegate.onDownloadCompleted();
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
}
