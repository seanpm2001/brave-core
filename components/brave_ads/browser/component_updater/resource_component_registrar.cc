/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_ads/browser/component_updater/resource_component_registrar.h"

#include "base/files/file_path.h"
#include "base/logging.h"
#include "base/strings/stringprintf.h"
#include "brave/components/brave_ads/browser/component_updater/component_util.h"
#include "brave/components/brave_ads/browser/component_updater/resource_component_registrar_delegate.h"

namespace brave_ads {

namespace {

constexpr char kComponentName[] = "Brave Ads Resources (%s)";

}  // namespace

ResourceComponentRegistrar::ResourceComponentRegistrar(
    Delegate* component_updater_delegate,
    ResourceComponentRegistrarDelegate& resource_component_registrar_delegate)
    : brave_component_updater::BraveComponent(component_updater_delegate),
      resource_component_registrar_delegate_(
          resource_component_registrar_delegate) {
  CHECK(component_updater_delegate);
}

ResourceComponentRegistrar::~ResourceComponentRegistrar() = default;

void ResourceComponentRegistrar::RegisterResourceComponent(
    const std::string& resource_id) {
  CHECK(!resource_id.empty());

  const absl::optional<ComponentInfo> component = GetComponentInfo(resource_id);
  if (!component) {
    return VLOG(1) << "Ads resource not supported for " << resource_id;
  }

  if (resource_component_id_ &&
      resource_component_id_ != component->id.data()) {
    Unregister();
  }
  resource_component_id_ = component->id.data();

  const std::string component_name =
      base::StringPrintf(kComponentName, resource_id.c_str());

  VLOG(1) << "Registering " << component_name << " with id " << component->id;

  Register(component_name, component->id.data(), component->public_key.data());
}

///////////////////////////////////////////////////////////////////////////////

void ResourceComponentRegistrar::OnComponentReady(
    const std::string& component_id,
    const base::FilePath& install_dir,
    const std::string& /*resource*/) {
  resource_component_registrar_delegate_->OnResourceComponentRegistered(
      component_id, install_dir);
}

}  // namespace brave_ads
