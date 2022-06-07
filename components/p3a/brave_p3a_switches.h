/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_P3A_BRAVE_P3A_SWITCHES_H_
#define BRAVE_COMPONENTS_P3A_BRAVE_P3A_SWITCHES_H_

namespace brave {
namespace switches {

// Interval between sending two values.
constexpr char kP3AUploadIntervalSeconds[] = "p3a-upload-interval-seconds";

// Avoid upload interval randomization.
constexpr char kP3ADoNotRandomizeUploadInterval[] =
    "p3a-do-not-randomize-upload-interval";

// Interval between restarting the uploading process for all gathered values.
constexpr char kP3ATypicalRotationIntervalSeconds[] =
    "p3a-rotation-interval-seconds";

// Interval between restarting the uploading process for all gathered values.
constexpr char kP3AExpressRotationIntervalSeconds[] =
    "p3a-express-rotation-interval-seconds";

// Interval between restarting the uploading process for all gathered values.
constexpr char kP3ASlowRotationIntervalSeconds[] =
    "p3a-slow-rotation-interval-seconds";

// P3A cloud backend URL.
constexpr char kP3AJsonUploadUrl[] = "p3a-json-upload-url";
constexpr char kP3ACreativeUploadUrl[] = "p3a-creative-upload-url";
constexpr char kP2AJsonUploadUrl[] = "p2a-json-upload-url";
constexpr char kP3AStarUploadUrl[] = "p3a-star-upload-url";
constexpr char kP2AStarUploadUrl[] = "p2a-star-upload-url";

// Do not try to resent values even if a cloud returned an HTTP error, just
// continue the normal process.
constexpr char kP3AIgnoreServerErrors[] = "p3a-ignore-server-errors";

constexpr char kP3AStarRandomnessUrl[] = "p3a-star-randomness-url";
constexpr char kP3AStarRandomnessInfoUrl[] = "p3a-star-randomness-info-url";

}  // namespace switches
}  // namespace brave

#endif  // BRAVE_COMPONENTS_P3A_BRAVE_P3A_SWITCHES_H_
