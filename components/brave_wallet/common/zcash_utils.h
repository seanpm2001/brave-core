#include <map>
#include <string>
#include <vector>

namespace brave_wallet {

//enum ZCashAddressType {
//  kTransparent,
//  kOrchard,
//};

std::string PubkeyToTransparentAddress(const std::vector<uint8_t>& pubkey,
                                       bool testnet);

}
