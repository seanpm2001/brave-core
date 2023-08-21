/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_COMMON_CALLBACK_SCOPE_H_
#define BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_COMMON_CALLBACK_SCOPE_H_

#include <type_traits>
#include <utility>

#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"

namespace brave_rewards::internal {

class CallbackScope {
 public:
  CallbackScope();
  ~CallbackScope();

  template <typename F>
  auto operator()(F callback) {
    return CallbackWrapper<F>::Wrap(weak_factory_.GetWeakPtr(),
                                    std::move(callback));
  }

 private:
  template <typename F>
  struct CallbackWrapper;

  template <typename... Args>
  struct CallbackWrapper<void(Args...)> {
    template <typename F>
    static auto Wrap(base::WeakPtr<CallbackScope> callback_scope, F callback) {
      return base::BindOnce(Handle<F>, std::move(callback_scope),
                            std::move(callback));
    }

    template <typename F>
    static void Handle(base::WeakPtr<CallbackScope> callback_scope,
                       F callback,
                       Args... args) {
      if (callback_scope) {
        callback(std::move(args)...);
      }
    }
  };

  template <typename C, typename... Args>
  struct CallbackWrapper<void (C::*)(Args...)>
      : public CallbackWrapper<void(Args...)> {};

  template <typename C, typename... Args>
  struct CallbackWrapper<void (C::*)(Args...) const>
      : public CallbackWrapper<void(Args...)> {};

  template <typename... Args>
  struct CallbackWrapper<void (*)(Args...)>
      : public CallbackWrapper<void(Args...)> {};

  template <typename F>
  struct CallbackWrapper
      : public CallbackWrapper<decltype(&std::decay<F>::type::operator())> {};

  base::WeakPtrFactory<CallbackScope> weak_factory_{this};
};

}  // namespace brave_rewards::internal

#endif  // BRAVE_COMPONENTS_BRAVE_REWARDS_CORE_COMMON_CALLBACK_SCOPE_H_
