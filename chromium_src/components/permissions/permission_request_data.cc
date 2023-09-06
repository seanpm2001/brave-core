/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "components/permissions/permission_request_data.h"
#include "components/permissions/permission_context_base.h"

#define PermissionContextBase PermissionContextBase_ChromiumImpl

#include "src/components/permissions/permission_request_data.cc"

#undef PermissionContextBase
