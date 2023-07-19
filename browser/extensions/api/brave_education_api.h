/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_EXTENSIONS_API_BRAVE_EDUCATION_API_H_
#define BRAVE_BROWSER_EXTENSIONS_API_BRAVE_EDUCATION_API_H_

#include "extensions/browser/extension_function.h"

namespace extensions::api {

class BraveEducationOpenSettingsFunction : public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("braveEducation.openSettings", UNKNOWN)

 protected:
  ~BraveEducationOpenSettingsFunction() override {}

  ResponseAction Run() override;
};

class BraveEducationOpenVerticalTabsSettingsFunction
  : public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("braveEducation.openVerticalTabsSettings", UNKNOWN)

 protected:
  ~BraveEducationOpenVerticalTabsSettingsFunction() override {}

  ResponseAction Run() override;
};

class BraveEducationEnableVerticalTabsFunction : public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("braveEducation.enableVerticalTabs", UNKNOWN)

 protected:
  ~BraveEducationEnableVerticalTabsFunction() override {}

  ResponseAction Run() override;
};

class BraveEducationStartVpnTutorialFunction : public ExtensionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("braveEducation.startVpnTutorial", UNKNOWN)

 protected:
  ~BraveEducationStartVpnTutorialFunction() override {}

  ResponseAction Run() override;
};

}  // namespace extensions::api

#endif  // BRAVE_BROWSER_EXTENSIONS_API_BRAVE_EDUCATION_API_H_
