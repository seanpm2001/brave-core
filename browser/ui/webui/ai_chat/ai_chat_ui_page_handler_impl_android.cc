// Copyright (c) 2023 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

#include "brave/browser/ui/webui/ai_chat/ai_chat_ui_page_handler_impl_android.h"

#include <utility>

#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/android/tab_model/tab_model.h"
#include "chrome/browser/ui/android/tab_model/tab_model_list.h"
#include "content/public/browser/web_contents.h"

namespace {
content::WebContents* GetActiveWebContents(content::BrowserContext* context) {
  auto tab_models = TabModelList::models();
  auto iter = base::ranges::find_if(
      tab_models, [](const auto& model) { return model->IsActiveModel(); });
  if (iter == tab_models.end()) {
    return nullptr;
  }

  auto* active_contents = (*iter)->GetActiveWebContents();
  if (!active_contents) {
    return nullptr;
  }
  DCHECK_EQ(active_contents->GetBrowserContext(), context);
  return active_contents;
}
}  // namespace

namespace ai_chat {

AIChatUIPageHandlerImpl::AIChatUIPageHandlerImpl(
    content::WebContents* owner_web_contents,
    Profile* profile,
    mojo::PendingReceiver<ai_chat::mojom::PageHandler> receiver)
    : AIChatUIPageHandler(owner_web_contents, profile, std::move(receiver)) {
  content::WebContents* web_contents = GetActiveWebContents(profile);
  InitAIChatUIPageHandler(web_contents == nullptr, web_contents);
}

AIChatUIPageHandlerImpl::~AIChatUIPageHandlerImpl() = default;

}  // namespace ai_chat
