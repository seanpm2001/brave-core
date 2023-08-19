/* Copyright (c) 2023 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_wallet/browser/zcash/zcash_keyring.h"

#include <memory>
#include <utility>

#include "base/strings/string_number_conversions.h"
#include "brave/components/brave_wallet/browser/brave_wallet_utils.h"
#include "brave/components/brave_wallet/common/encoding_utils.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace {
constexpr char kBip84TestMnemonic[] =
    "immense leader act drama someone renew become mention fragile wide cinnamon obtain wool window mirror";
}

namespace brave_wallet {
using mojom::BitcoinKeyId;

// https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki#test-vectors
//TEST(ZCashKeyringUnitTest, TestVectors) {
//  ZCashKeyring keyring(false);
//  keyring.ConstructRootHDKey(*MnemonicToSeed(kBip84TestMnemonic, ""),
//                             "m/44'/0'");

//  EXPECT_EQ(
//      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(0, 0, 0))),
//      "0330D54FD0DD420A6E5F8D3624F5F3482CAE350F79D5F0753BF5BEEF9C2D91AF3C");
//  EXPECT_EQ(
//      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(0, 0, 1))),
//      "03E775FD51F0DFB8CD865D9FF1CCA2A158CF651FE997FDC9FEE9C1D3B5E995EA77");
//  EXPECT_EQ(
//      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(0, 1, 0))),
//      "03025324888E429AB8E3DBAF1F7802648B9CD01E9B418485C5FA4C1B9B5700E1A6");

//  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 0, 0)),
//            "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu");
//  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 0, 1)),
//            "bc1qnjg0jd8228aq7egyzacy8cys3knf9xvrerkf9g");
//  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 1, 0)),
//            "bc1q8c6fshw2dlwun7ekn9qwf37cu2rn755upcp6el");
//}

TEST(ZCashKeyringUnitTest, GetAddress) {
  ZCashKeyring keyring(false);
  keyring.ConstructRootHDKey(*MnemonicToSeed(kBip84TestMnemonic, ""),
                             "m/44'/133'");

  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 0, 0)),
            "t1fhcesXQLT3U1t7caBYTpd59LiRV8tVfqj");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 0, 1)),
            "t1WTZNzKCvU2GeM1ZWRyF7EvhMHhr7magiT");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 0, 2)),
            "t1NPwPhNPHc4S8Xktzq4ygnLLLeuVKgCBZz");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 0, 3)),
            "t1fe6a9otS98EdnucHLx6cT4am6Ae6THUgj");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 0, 4)),
            "t1dA52xDndfEo9jJU7DBFSKuxKMqZMMLEGL");

  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 1, 0)),
            "t1RnTVUMzs1Hi2smgk6EJpVMA2upwTpESYP");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 1, 1)),
            "t1YRbQiMhwS7mui9r7E2aWGmkLC1xHQnFoc");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 1, 2)),
            "t1ZnyiWoaS9sceAQKjiK4ughBRQu9z2MXcB");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 1, 3)),
            "t1WwSQBqGUYf4AXKE6nNR3fp61awb6qsM8z");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(0, 1, 4)),
            "t1WLKBRDxENW35SLrsW125Yt5tYJDYpBs1i");


  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 0, 0)),
            "t1LquzEnJVAqdRGeZJZbomrsKwPHuGhNJtm");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 0, 1)),
            "t1JgGisPzWWN1KMbN82bfKvk9Faa5eKqHUg");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 0, 2)),
            "t1fmqM2ud5FEgRTLo17QS4c2i575GD8QQCq");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 0, 3)),
            "t1SoBVfwQvRi7X8RuSxNvkm8NBrbbaUJo5c");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 0, 4)),
            "t1YuvWycJoxFVvuGHSJEkP5jtfe5VjXyGyj");

  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 1, 0)),
            "t1NFJ9Jn6su9bGH7mxjowBT6UsPTQdSpVF7");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 1, 1)),
            "t1SfWeR1cGcxv9G7sBMFP1JubyKBujSFu1C");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 1, 2)),
            "t1efWNVCp5sDvkRtrJxq6jrdJDbxwsYBxfb");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 1, 3)),
            "t1g4WDhMPb8e8GUWuV1JEAPa32bgVkeoSuJ");
  EXPECT_EQ(keyring.GetAddress(BitcoinKeyId(1, 1, 4)),
            "t1ZTmbmys2n8UjVRb2tfE17A9V6ehZNqZ4W");
}

TEST(ZCashKeyringUnitTest, GetPubkey) {
  ZCashKeyring keyring(false);
  keyring.ConstructRootHDKey(*MnemonicToSeed(kBip84TestMnemonic, ""),
                             "m/44'/133'");

  EXPECT_EQ(
      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(0, 0, 0))),
      "022C3E9812AA4DC6B93BAACAF54AFAA1FF6CCF65EA2493763AA66C8C8B18CD03CE");
  EXPECT_EQ(
      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(0, 0, 1))),
      "02846F3C6216F046D0C69D22EDAEAE70C2C1887F3A81F63CFE604F645F68AD95D4");
  EXPECT_EQ(
      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(0, 1, 0))),
      "02F464FA6B80AAC09328B3E1E09B5CA10C46AD1F404BCCB897200EC9A149C5DBB5");

  EXPECT_EQ(
      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(1, 0, 0))),
      "038B5E4C440B54B5C63C460E8AE5042157917A6DEDF5CE951E22B85BA3E125D2CE");
  EXPECT_EQ(
      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(1, 0, 1))),
      "0309093DA6A36773835DF2C83431889BC7889E34B6A17DDFBEF608E79D951BD4BA");
  EXPECT_EQ(
      base::HexEncode(*keyring.GetPubkey(BitcoinKeyId(1, 1, 0))),
      "03D21E1C5E65174FB6214D0C818F6B2C1EAD0CC0F0B37CD7B12C7517D6C0A7BF3D");

//  BitcoinKeyring testnet_keyring(true);
//  testnet_keyring.ConstructRootHDKey(*MnemonicToSeed(kBip84TestMnemonic, ""),
//                                     "m/84'/1'");

//  EXPECT_EQ(
//      base::HexEncode(*testnet_keyring.GetPubkey(BitcoinKeyId(0, 0, 0))),
//      "02E7AB2537B5D49E970309AAE06E9E49F36CE1C9FEBBD44EC8E0D1CCA0B4F9C319");
//  EXPECT_EQ(
//      base::HexEncode(*testnet_keyring.GetPubkey(BitcoinKeyId(0, 0, 1))),
//      "03EEED205A69022FED4A62A02457F3699B19C06BF74BF801ACC6D9AE84BC16A9E1");
//  EXPECT_EQ(
//      base::HexEncode(*testnet_keyring.GetPubkey(BitcoinKeyId(0, 1, 0))),
//      "035D49ECCD54D0099E43676277C7A6D4625D611DA88A5DF49BF9517A7791A777A5");

//  EXPECT_EQ(
//      base::HexEncode(*testnet_keyring.GetPubkey(BitcoinKeyId(1, 0, 0))),
//      "024AC8DA6430EC1C3D7DB1C01EBCB26F037303A28565587B76A275CD5D286DADE0");
//  EXPECT_EQ(
//      base::HexEncode(*testnet_keyring.GetPubkey(BitcoinKeyId(1, 0, 1))),
//      "03392B97B3B3900E27431BDF516E0A5A8B6706D1827B85567FC0E45FA3109A0BC7");
//  EXPECT_EQ(
//      base::HexEncode(*testnet_keyring.GetPubkey(BitcoinKeyId(1, 1, 0))),
//      "03780B696D530DEF424B80368C5F401D12FBF7B59A56CA559AB083DFD2AF405568");
}

//TEST(BitcoinKeyringUnitTest, SignBitcoinMessage) {
//  // TODO(apaymyshev): make test
//}

}  // namespace brave_wallet
