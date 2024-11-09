import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Text "mo:base/Text";

//import the custom types you have in Types.mo
import Types "Types";


//Actor
actor {

//This method sends a GET request to a URL with a free API you can test.
//This method returns Coinbase data on the exchange rate between USD and BTC
//for a certain day.
//The API response looks like this:
//  [
//     [
//         1641081600, <-- start timestamp
//         47400, <-- lowest price during time range
//         47770.37, <-- highest price during range
//         47733.43, <-- price at open
//         47637.43, <-- price at close
//         455.5481161 <-- volume of BTC traded
//     ],
// ]

  public func get_icp_usd_exchange() : async Text {

    //1. DECLARE MANAGEMENT CANISTER
    //You need this so you can use it to make the HTTP request
    let ic : Types.IC = actor ("aaaaa-aa");

    //2. SETUP ARGUMENTS FOR HTTP GET request

    // 2.1 Setup the URL and its query parameters
    let host : Text = "api.exchange.coinbase.com";
    let url = "https://" # host # "/products/BTC-USD/candles?granularity=3600&start=2022-01-01T00:00:00Z&end=2022-01-02T00:00:00Z";

    // 2.2 prepare headers for the system http_request call
    let request_headers = [
        { name = "Host"; value = host # ":443" },
        { name = "User-Agent"; value = "exchange_rate_canister" },
    ];

    // 2.2.1 Transform context
    let transform_context : Types.TransformContext = {
      function = transform;
      context = Blob.fromArray([]);
    };

    // 2.3 The HTTP request
    let http_request : Types.HttpRequestArgs = {
        url = url;
        max_response_bytes = null; //optional for request
        headers = request_headers;
        body = null; //optional for request
        method = #get;
        transform = ?transform_context;
    };

    //3. ADD CYCLES TO PAY FOR HTTP REQUEST

    //The IC specification spec says, "Cycles to pay for the call must be explicitly transferred with the call"
    //The management canister will make the HTTP request so it needs cycles
    //See: /docs/current/motoko/main/canister-maintenance/cycles

    //The way Cycles.add() works is that it adds those cycles to the next asynchronous call
    //"Function add(amount) indicates the additional amount of cycles to be transferred in the next remote call"
    //See: /docs/current/references/ic-interface-spec#ic-http_request
    Cycles.add(20_949_972_000);

    //4. MAKE HTTP REQUEST AND WAIT FOR RESPONSE
    //Since the cycles were added above, you can just call the management canister with HTTPS outcalls below
    let http_response : Types.HttpResponsePayload = await ic.http_request(http_request);

    //5. DECODE THE RESPONSE

    //As per the type declarations in `src/Types.mo`, the BODY in the HTTP response
    //comes back as [Nat8s] (e.g. [2, 5, 12, 11, 23]). Type signature:

    //public type HttpResponsePayload = {
    //     status : Nat;
    //     headers : [HttpHeader];
    //     body : [Nat8];
    // };

    //You need to decode that [Nat8] array that is the body into readable text.
    //To do this, you:
    //  1. Convert the [Nat8] into a Blob
    //  2. Use Blob.decodeUtf8() method to convert the Blob to a ?Text optional
    //  3. You use a switch to explicitly call out both cases of decoding the Blob into ?Text
    let response_body: Blob = Blob.fromArray(http_response.body);
    let decoded_text: Text = switch (Text.decodeUtf8(response_body)) {
        case (null) { "No value returned" };
        case (?y) { y };
    };

    //6. RETURN RESPONSE OF THE BODY
    //The API response will looks like this:

    // ("[[1641081600,47400,47770.37,47733.43,47637.43,455.5481161]]")

    //Which can be formatted as this
    //  [
    //     [
    //         1641081600, <-- start/timestamp
    //         47400, <-- low
    //         47770.37, <-- high
    //         47733.43, <-- open
    //         47637.43, <-- close
    //         455.5481161 <-- volume
    //     ],
    // ]
    decoded_text
  };

  //7. CREATE TRANSFORM FUNCTION
  public query func transform(raw : Types.TransformArgs) : async Types.CanisterHttpResponsePayload {
      let transformed : Types.CanisterHttpResponsePayload = {
          status = raw.response.status;
          body = raw.response.body;
          headers = [
              {
                  name = "Content-Security-Policy";
                  value = "default-src 'self'";
              },
              { name = "Referrer-Policy"; value = "strict-origin" },
              { name = "Permissions-Policy"; value = "geolocation=(self)" },
              {
                  name = "Strict-Transport-Security";
                  value = "max-age=63072000";
              },
              { name = "X-Frame-Options"; value = "DENY" },
              { name = "X-Content-Type-Options"; value = "nosniff" },
          ];
      };
      transformed;
  };
};
