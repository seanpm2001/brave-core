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

import com.brave.playlist.util.MediaUtils;

import org.chromium.base.ContextUtils;
import org.chromium.base.Log;
import org.chromium.mojo.system.MojoException;
import org.chromium.playlist.mojom.PlaylistService;
import org.chromium.playlist.mojom.PlaylistStreamingObserver;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class DownloadUtils {
    private static final String GET_METHOD = "GET";
    private static final String TAG = "Playlist.DownloadUtils";
    public interface PlaylistDownloadDelegate {
        default void onDownloadStarted(String url, long contentLength) {}
        default void onDownloadProgress(long totalBytes, long downloadedSofar) {}
        default void onDownloadCompleted() {}
    }
    public static void downloadFile(PlaylistService playlistService, String url,
            DownloadUtils.PlaylistDownloadDelegate playlistDownloadDelegate) {
        Log.e(TAG, "queryPrompt : " + url);
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
                                Log.e(TAG, "onResponseStarted : " + url);
                                File mediaFile = new File(
                                        MediaUtils.getTempFile(ContextUtils.getApplicationContext())
                                                .getAbsolutePath());
                                if (mediaFile.exists()) {
                                    mediaFile.delete();
                                }
                                playlistDownloadDelegate.onDownloadStarted(url, contentLength);
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }

                        @Override
                        public void onDataReceived(byte[] response) {
                            Log.e(TAG, "onDataReceived : " + response.length);
                            downloadedSofar = downloadedSofar + response.length;
                            try {
                                MediaUtils.writeToFile(response,
                                        MediaUtils.getTempFile(ContextUtils.getApplicationContext())
                                                .getAbsolutePath());
                                playlistDownloadDelegate.onDownloadProgress(
                                        totalBytes, downloadedSofar);
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }

                        @Override
                        public void onDataCompleted() {
                            Log.e(TAG, "onDataCompleted : ");
                            try {
                                // List<Segment> segments = HLSParsingUtil.getContentSegments(
                                //         MediaUtils.getTempManifestFile(PlaylistHostActivity.this)
                                //                 .getAbsolutePath(),
                                //         manifestUrl);
                                // for (Segment segment : segments) {
                                //     // Log.e("data_source",
                                //     //         "segment.url : " +
                                //     //         UriUtil.resolve(manifestUrl,
                                //     //         segment.url));
                                //     segmentsQueue.add(segment);
                                // }
                                // playlistService.clearObserverForStreaming();
                                // Segment segment = segmentsQueue.poll();
                                // if (segment != null) {
                                //     downalodHLSFile(manifestUrl, segment);
                                // }
                                playlistDownloadDelegate.onDownloadCompleted();
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
}
