/**
 * Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package org.chromium.chrome.browser.rewards.onboarding;

import android.content.Context;
import android.graphics.Typeface;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

public class CountrySelectionSpinnerAdapter extends ArrayAdapter<String> {
    public CountrySelectionSpinnerAdapter(Context context, String[] countries) {
        super(context, android.R.layout.simple_spinner_item, countries);
    }

    @Override
    public View getDropDownView(int position, View convertView, ViewGroup parent) {
        View view = super.getDropDownView(position, null, parent);
        TextView textViewName = view.findViewById(android.R.id.text1);

        if (position == 1) {
            textViewName.setTypeface(textViewName.getTypeface(), Typeface.BOLD);
        }

        return view;
    }
}
