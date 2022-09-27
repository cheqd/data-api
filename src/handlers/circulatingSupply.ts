import { GraphQLClient } from "../helpers/graphql";
import { BigDipperApi } from "../api/bigDipperApi";
import { Request } from "itty-router";
import { ncheq_to_cheq_fixed } from "../helpers/currency";
import { filter_marked_as_account_types } from '../helpers/validate';
import { total_balance_ncheq } from "../helpers/node";

async function get_circulating_supply(circulating_supply_watchlist: string[]): Promise<number> {
    let gql_client = new GraphQLClient(GRAPHQL_API);
    let bd_api = new BigDipperApi(gql_client);

    let filtered_accounts = filter_marked_as_account_types(circulating_supply_watchlist);
    // let non_circulating_accounts = await bd_api.get_accounts(filtered_accounts.other);

    let total_supply = await bd_api.get_total_supply();
    let total_supply_ncheq = Number(total_supply.find(c => c.denom === "ncheq")?.amount || '0');

    try {
        const cachedBalances = await CIRCULATING_SUPPLY_WATCHLIST.list({
            prefix: "grp_"
        })

        console.log(`found ${cachedBalances.keys.length} cached items`)

        let non_circulating_supply_ncheq = 0;
        outer:
            for (const account of cachedBalances.keys) {
                const k = account.name.split('.')

                for (const n in [ 1, 2, 3 ]) {
                    let cachedFound = await CIRCULATING_SUPPLY_WATCHLIST.get(`grp_${n}.${k[1]}`);

                    if (cachedFound) {
                        console.log(`found cache entry: ${cachedFound}`)
                        const data = JSON.parse(cachedFound)
                        non_circulating_supply_ncheq += total_balance_ncheq(data);
                        continue outer
                    }
                }

            }

        console.log(`Non-circulating supply: ${non_circulating_supply_ncheq}`);
        // Get total supply
        let total_supply_ncheq = Number(total_supply.find(c => c.denom === "ncheq")?.amount || '0');
        console.log(`Total supply: ${total_supply_ncheq}`);

        // Calculate circulating supply
        return total_supply_ncheq - non_circulating_supply_ncheq;
    } catch (e) {
        console.error(e)
    }

    return total_supply_ncheq
}

export async function handler(request: Request): Promise<Response> {
    let addresses_to_exclude: string[] = (await CIRCULATING_SUPPLY_WATCHLIST.list()).keys.map(k => k.name);

    // let circulating_supply = await get_circulating_supply(addresses_to_exclude);
    let circulating_supply = await get_circulating_supply(getTempAddresses());

    return new Response(ncheq_to_cheq_fixed(circulating_supply));
}

function getTempAddresses() {
    let addresses_to_exclude = [
        "cheqd102mzdp87r6tjy0ttlgsxmldjex68k9tuxnqkwn",
        "cheqd1074lwwsya2nvgfklg403aa9jtkgl7nml5zylg9",
        "cheqd108q99w63he0uq2xa28gxf7hkpeqt8r5uqt9ghk",
        "cheqd109c4836wy0aa9ft7uhvu6z5yxx55zh3yqjfle0",
        "cheqd10e4zkalt6uqd3cwgtr8g4ychjjhrwq5n743j65",
        "cheqd10lffy494en7teacp7ty9lgj5m9u333ps8cjns6",
        "cheqd10nse74dkac20enn3ame36u73llc2tmnuehpj5f",
        "cheqd10pps0c8msgsvjzrx2zge0tl68x93dzzfyszhqq",
        "cheqd10tu4wnj67d8cnpwycllwur6qnltg87xfshndpf",
        "cheqd10yut7vc3uvrasju4aa6tpwdxrmwdn6auxxeqft",
        "cheqd128fra0sj9fgz9pmupc7dnrupgr38nm86wq3r34",
        "cheqd12ht2skvkw4nnhq6fc48vlkugl0myryymaxmhhh",
        "cheqd12lvv4cqdznu4q4gnwm3x4tjfqa4de49v49quq2",
        "cheqd12tt8jn5fdlvedmxn4356rvn362g77tz4yv5za4",
        "cheqd12vdx3selza7mk0qw6njtupfmkfk4nzl2jyqac7",
        "cheqd12ys2yeqwa57083xhd5wjgjjp69f7jafqd6q4zr",
        "cheqd130g8d4t7x5vpkdvuekzltghcv7re6ul35dgcq2",
        "cheqd13duhx9h5g9z7qxy2u0uzselv2hljmzzslae5l5",
        "cheqd13tgpmr4ueuw022l6nxkew823czawc00j56uh9w",
        "cheqd13w44vy7s6mrqpxwc5ujpjfcldjzhkx5xfzeq94",
        "cheqd13wvtjk3v5g4q7pema74nv9lrarr8e6vlx93zat",
        "cheqd13x8zvv4a36mpcp278m53r5wesfsx2wwsrsn6kn",
        "cheqd144j9sw5884vwnlem6sedtzj8rgsmaz7zsa6r96",
        "cheqd14av5en2qpj3fgzyt2krx9kt3mlp8cn8mzqppfs",
        "cheqd14c9fyc55szuwep6y2krnrqvm7qs97ret3uyjps",
        "cheqd14gxh72xdtx5hh7ctg70lg3yy3gratlexsaj8ze",
        "cheqd14hj6lrj3eaqlg0syf642eng3a2qm743kdaaddp",
        "cheqd14re975jg2e3q2r60e0xdag77n8mz8t0mpffe9z",
        "cheqd14ucjrgm8jm5z7yv322lgz3w9wz2psve7wncv5q",
        "cheqd14vnqa3msv72ucp4j3lqhpvsmxuyu89qzvlazpk",
        "cheqd14vyyr9a57mspj4kugg6yylcuqkxytm2q4srzra",
        "cheqd14y0hce2rclpmcn8w0vvffc4f8fjlghduzn09pn",
        "cheqd152wh3482jks8me22l085c7jcxtk74rm9yrhv08",
        "cheqd157kn6s6p74ps7kmgnr6vvrqj47sx2895mxvr0f",
        "cheqd15dg3zjxru3pus6qu5spn4g7n8d6f68wtslvssn",
        "cheqd15erqx74e4q532cxp9jgsqc5gc045kaefnuakav",
        "cheqd15eu3jgyezmct6yhanh3dpwsfn9qrulkna7q4rx",
        "cheqd15gjydlputcmwxudnasc6c6sla2zy0cjs88svyd",
        "cheqd16qcyenxplnsrgrpnnqmxgv2p2ddqwnjpz9quy3",
        "cheqd16umet2xymlj8xtnqzr34vd06sml3fz8ujlm5en",
        "cheqd16xz82c9u3w3yfsx6kjrrj39v5nx2lflysyf5ay",
        "cheqd16zs74amn0es66vrryevr3pfa25pjwyllv575jv",
        "cheqd173k83wpkgtr6xtx26caumsqkpwplpt0k0vr0y7",
        "cheqd1774h8jzpv2kk5pasdrumknauypnm05nm6qjcsv",
        "cheqd1782hcsf7m88pswfk2kn3zeujjzuykgzs5f00j8",
        "cheqd1786x2uuudf5clle7s4e6y3safl4hwkhtgymdny",
        "cheqd17c4jf69dl9d38aw5uysn8clf95xs8t74w33m6z",
        "cheqd17jhrply2h0xk0zwku6859dr0y693379tunwcnl",
        "cheqd17l9yrd0gt2dkgqdu4nknwdr7g7c22y4k94s2pl",
        "cheqd17lqrgwg8lx8hp69jhku3t4hxx86qpw5cgx5l4n",
        "cheqd17p5tyat3nr2kyqt49rak05s8ceftq6ykx5qt4t",
        "cheqd17wrwqxsfwy4rqlltjhj6jxtz68tvxm0ykge5dr",
        "cheqd17xekaxgwvn04dqmda37n5v5yatwe0pwm6umw2j",
        "cheqd17xh3a5qvqy3tp4y9hp482ssl3pe2gq9j5m8zmh",
        "cheqd17zjfjw5emz9r48wtma2hwhql334s0f375jvx72",
        "cheqd182d4zh33fmgj38yhqv0ryapuancagvpj52frye",
        "cheqd187k4vzggkx0kdurxg3xffdeehnfw4m0hm7h27s",
        "cheqd18e9am44nt43w4qdg3s402ymzrvfdc37qd3pyt9",
        "cheqd18jzpf9mvpaprtccvvsvpunv758p4avkk62nvd9",
        "cheqd18n4a450pwne88u8g5p53pufdyaqhlxes6v5hwf",
        "cheqd18p5t6pru4nnh8qmsnf3w90uqvk2e9aezlhym53",
        "cheqd18pcq5jxm8vz0jkmm484y7n6g49ysclkz5jwr2e",
        "cheqd18pwcnw73tsg3gguukwgx50u2d62zk4hspv8l32",
        "cheqd19cjct09g4a50yqjavuflscqfqcqns2yp05n5ms",
        "cheqd19tql8zv4kpp7umgx0nn6nt7qf0k29kx4h4trpe",
        "cheqd19wxf36lwgkktuampg3w6uaw7grsy3gnrxj4t4h",
        "cheqd1a25g2fln0racf9dlfn3g6e3vezvgynnez8uv0z",
        "cheqd1aasqs6cn3hy2pqsypd6az0y8f5va32hhpxz8gh",
        "cheqd1avu2ll646ypnjqa542rqpe0g26cfesve337ml8",
        "cheqd1awfupskqfhev874vfjnpw9t0v94uuqhk74q3d4",
        "cheqd1c3kwrlxsy3yz3phpap20z20j5qr2du3clgzs30",
        "cheqd1c6g9nnlw2ht38ak3cpxu7p4yjaeef8m7frc0xp",
        "cheqd1cgmzu9f9heas5ta46drxpeuk5yyn8v36yjlje7",
        "cheqd1ck6rv3mst963m3pm5k8rg66elera8v26pah03f",
        "cheqd1czauh9jmwgh9yc090gnhvmk337kz3jnarwuxed",
        "cheqd1ddthz5uhx2382av5ew9t7yx25dznwhy0rpzzz3",
        "cheqd1dksptzr757fe9tl23ywmp4guucsz0fl8e8ggll",
        "cheqd1dp2tqng7lkm094t0g85etjet5rvlcue6hynx6p",
        "cheqd1dqql2afmdc5wwzl74mu6f3jg5fxk6ksy6z7ma8",
        "cheqd1dvxce4elk8lfph8c52mlevgkyg5lxdw6vgjf8h",
        "cheqd1e4tdx3xfchd5vj0tmqgtdpkmlsftqvej8j9l6v",
        "cheqd1e6y9pqk538qwdsra4y44a3qjll9tmgx44tx8e2",
        "cheqd1e7jpqg3960msznsghctj9cxv4w7w4qph6g8jlz",
        "cheqd1ecxmdrr5fhghskvawdyulqrczm604kx8dr5lgg",
        "cheqd1ekt65hyudh5lhzjw55ctxqgtkddjeykfcqljkv",
        "cheqd1eld0vlqy3tlmkhf7lgdcefc8qz7ny0cdk9j2ry",
        "cheqd1ereqx3s4c3grc78w8ta2nmjk7a35p694rkt4zc",
        "cheqd1f38cesgyn8yhkl9lhrxv4urr9gtl444k02uxac",
        "cheqd1f9aunuufxy6euayzegxvp4jy3uy2xzcuarnmsl",
        "cheqd1f9xhnvmdetn9mkh0w3pcll9rzy90uhwj5c0k9k",
        "cheqd1fkxggf3m5ptap7h7fyh9ht095khuar026crx3c",
        "cheqd1fqfwhraax5ngk0upwknej0jlpxc3ev7me7ht7s",
        "cheqd1ftt2485zh3yn0t850atw34m2ctwvghsyf6kdr6",
        "cheqd1fww87qsvqchyq9xwqcj5w550f2kxu6eyf75wsu",
        "cheqd1fxkzl28rqsmjrl48qhkrzug42fhwg4xxtyuvgq",
        "cheqd1gal47c74jets5ref6wjxguzqmkgry73z4u8tdh",
        "cheqd1gp2nftpztxh44ex3vjqwfdvnvj2fkwtpn3g4gg",
        "cheqd1gq6sn7fdeeplltyuv0tp76hq7766v64w8yktxj",
        "cheqd1gzzlq30nwlctxdjg36fmy8djjycs2puvmmnmke",
        "cheqd1h6hktd76fa93zt078nlrcrdndk7ynmg04an0fh",
        "cheqd1h8mxrwh2n9gklz52m3wx0zr9230m727cjrsxw9",
        "cheqd1hmc79es4m72l6yy4dmya4dclhnzdp3550ykfy8",
        "cheqd1hmhktc89jmzhyf9y6qt7dzc7cy7cgu3cnqs6wp",
        "cheqd1hn9m0pjxp4p4003xnzcmze7gydhg8a8r0858vd",
        "cheqd1hprhwj8cny5p3w2nt9av3w0d9kr80ttdhagjte",
        "cheqd1hzslf2k0a7k722vzvamyrt7tfq3447xk5ggfvg",
        "cheqd1jcm85acd9jvvz6u43v3f2pk9lncatu879c4a8u",
        "cheqd1jhttw93wzjrcjm8a74g8aph3wnpjfnqd9568t6",
        "cheqd1jp00saqjfcdxkxqf9e8vrpyd4at9xlc7gf2syg",
        "cheqd1juq5zgzjr92c4wn8cy39g3sws28du0crmfpjuc",
        "cheqd1k86579yh9j49q9xtp4ta55zy6ad9azhrraal7k",
        "cheqd1kj93ee7zkw44p9h0fnd6f8yhzeh509wg4acjjn",
        "cheqd1kn3vj97l4k8t55073ragpk9zeufrnzh80ah9vs",
        "cheqd1kputn5c3f0hn7da98lqf4c35fllxxeycrldutr",
        "cheqd1kqx7q0dr3pn8hyxpu25gaz3m3qs835ldklmumk",
        "cheqd1kr7dv9n6dnmjy0dldqxtp5dgq0jh6uhd5hx9z2",
        "cheqd1kv5fha5ylprfd558f7r0uyex8rek8etpfxc6wu",
        "cheqd1l8hvrw2j82er654s3dvvj9w9jjkcekqsx0jz8w",
        "cheqd1l8uy4yn6utfgy65smmw40m8c4uyarw2hc8pkw9",
        "cheqd1la5t260ggu3mkc7aha3ftwj40laynygy9chevy",
        "cheqd1lg0vwuu888hu4arnt9egtqrm2662kcrtkqz49j",
        "cheqd1lhch7spf87rgnev56xnqh2dqhpfk3eatdnth5y",
        "cheqd1lqtfptxeurmd54xy7zkns7qwwutvns0w4ufyft",
        "cheqd1m6uas09cczhyra3up3tn4calwvl7ygxvxym7a0",
        "cheqd1m7d75z29hqu2d0uv0mk2s88um5hvj259md7758",
        "cheqd1ma754mlx2rdvshae9t8jkz2c4x7ft2lpkmn8vt",
        "cheqd1mjlhlt3yx9tqjsnprtsxemf9hwxwxgd3r6xrnr",
        "cheqd1mw6xpmqt7u7mlcu0lerh7dw5c9rvsqsthqcgrw",
        "cheqd1nfsz8r4p359fsctk0lt4ee3kma0zg89xldxpqu",
        "cheqd1nqzypqthx348llfuj9j5xftzfua2l75qy9fwq6",
        "cheqd1nu5aaszuxjvxt5x8eq2s8tlad4nwjk2acn8cj3",
        "cheqd1p02e0x204a49utmkgwjdk9kpy8gqtcm7mpu87l",
        "cheqd1p9szkzftfddxce82ymckgxuxwtqc6d4k2at4ep",
        "cheqd1pc02hdy79wuwyxzy7ucumnmaexp9gx5wa5ckqr",
        "cheqd1pdu0r224x6tvfkhswnqrq9z5w4d73jns4u3k2m",
        "cheqd1phmz70wgzyahlacn78hwzdkwu5fky5tfl8gfs3",
        "cheqd1pqqlxl3msedxcej57q9examfzhu0ttzdsp02pw",
        "cheqd1psrm6t3hqwzvmfnw6x4ysf0hd240a3k3d9yy27",
        "cheqd1py8mmqqv3wk22ae4pz0r0da7x9zzrxefzugklh",
        "cheqd1pydlf8h7ezlkpwq8ud3gdx83ra9me47z48qtat",
        "cheqd1q3k2ne32vtx2dvf8ee7vpafcvdsrsvqx5thf72",
        "cheqd1q449p4s8c4t8chdrx9gk5nlqt43v508erl7qsu",
        "cheqd1q5cazs6yuvmcf34z369z2fvt2ec6n2f7vp06hm",
        "cheqd1q8ghndxp657hajzsk4trfkuh5zrm74vedyhplh",
        "cheqd1q9tznprszw5usu55yfk42fenfe6tyq58j53skg",
        "cheqd1qaa9pd60g6ry9u3kf9sezw26lyejky8xayr52s",
        "cheqd1qc7nexzm8egzte8amh0qusg99xjsnc2w7m96c5",
        "cheqd1qn78q6tddxxz2rpcflsuququvuvjalrunxp3c7",
        "cheqd1qs0nhyk868c246defezhz5eymlt0dmajna2csg",
        "cheqd1qvj2uuyvalx22lqnehh3awjcq35a0rz5gpudtm",
        "cheqd1r2g7e6ymdwfql5j87gs0xv5llh9xp692vfwruq",
        "cheqd1s3hqzaraajvlkpl4fseteenad2zev9hmhfdhrd",
        "cheqd1s7qgtdpyw9cj2swkdhzywwlssxapndcalrfy5q",
        "cheqd1s8f3rqprpwhn0vxl6me76qwg6y9cpxj2yjjy3l",
        "cheqd1s9wn3wxea4maef8t04jyusnpc29p58v83eesz0",
        "cheqd1scxe3jqyuqv0flgl0w3s95hhy9jsp98h5a24pk",
        "cheqd1sr0066h5p2ncfc8hnrgqlw3lqxgylwn06ccl9e",
        "cheqd1sv4w8tadeulklgwpu477ls3rvd2se3cuftdvkr",
        "cheqd1t0qhk7kqe6vv36alehrwn2ht5e0dc8wh2uzkr6",
        "cheqd1t0vw4kha8ffw0sfsd2k56287q73zwnca5gr7l2",
        "cheqd1t3gsdl2uux0rmt3acn8qursc9sarhtm6mpa3hq",
        "cheqd1t5pl7x25egk2xcfu2kyg4a7ga4hyg2g5anv5hh",
        "cheqd1tgtgmksy2de42nzahk9kwml9crf36r735xwazj",
        "cheqd1thhqk2q4s8h3ugwjm4h2v09gxaturfzkyjeux3",
        "cheqd1tml0chnp3mee88cyk63la3ctj9ndu4vtl2e2m7",
        "cheqd1tpvhkuvn8je2qdghexfsgeg0q37zcqej06m30x",
        "cheqd1tqpxjdnxcjqswrcq5slz64wrh7t5j6jle7gwfh",
        "cheqd1tt5p2xwz3xv2d4wjkegycu6pauv3jxyta3vj0r",
        "cheqd1tx65lajxvzwmvfxwvev23kxac2v3zj3jg0hrcw",
        "cheqd1u3uwj2rvxt6ytweypemcc35vy80zwlnx7ly6wt",
        "cheqd1ucxsrv5yyvxhjk2cu3gl54l94dru7apgwrlk9q",
        "cheqd1uvjqw3wadfjycznpe0z8u36aqnecndtzlwgf7s",
        "cheqd1va3slq5k97a008gxncn9eavvf4mt84xcmej65l",
        "cheqd1vex9phvwcwr785k2jal7tv2pklysqx94kzay8a",
        "cheqd1vh0rar0jgyx8xeett26nv77jnvxr99k8q8qa6q",
        "cheqd1vj9qtf9fy00q8xnwxfwsswtr24ajl8a592hyp8",
        "cheqd1vl23k3x73wzq4t7x3sh54n5f40kpse32pleka6",
        "cheqd1vlu2azc2fs9p5zffyeefth0l79eygwj8vmt2r6",
        "cheqd1vusv4s233mw867ua63m7upjxzgcyqhwhumqe6d",
        "cheqd1vxfyppcnu6lz72mdc706mlv7kx8434jaknhgt6",
        "cheqd1w5xsmev2zv59yhtk5nsl6xrdwpu588k5su6xs0",
        "cheqd1wsf8ns8gmcq76nes484pt46c9ru9c9mdmwm7sc",
        "cheqd1wwwncrnde9myewpn8j00xeyt4hfs3sqmkyasqm",
        "cheqd1wznaxsqya0meesp9f8xrknnreuszfd8kup3mq5",
        "cheqd1wzyfq9ujg7vp3whn7nh7w5ner8p7ghk2pxw0g5",
        "cheqd1x7ku9c2x2j263yaj48ct9nwjark75f0hhgmpvg",
        "cheqd1x9dc5enk7f77apgscc3emep5nz0fapxm4w9r9m",
        "cheqd1xqgm3nw0uh4k4zj0u4l2ljfqslrfumff5syu49",
        "cheqd1xqxz5wneg2hqg9tugzuv8v8wgyr2pl32v2h3hl",
        "cheqd1xs7kvk7n7m6ca6yw7ysxxfulwauc2s46z2w283",
        "cheqd1xusdhhtlqk0vetgqg7nu39j9q62zq63q22k463",
        "cheqd1xwnu2mm96uexuergqk0kqt4ds84x9zsjyne49e",
        "cheqd1xyyygaxx384k07sv3rk9zj7dezuzf250pahr0w",
        "cheqd1y6ekzultqshf8xwtv46mlzfquj6ys3vmncascq",
        "cheqd1y8edvwl536rxuqdznh48mh6mg648gf9a3xx2s9",
        "cheqd1ygwl8m54cpenq7t5v5p0y9xau3gmg873fqlqag",
        "cheqd1ylfukxalf0zr2wdma0gx33e9fccha94qr59rj4",
        "cheqd1yp52vx7sjv2dhhfqe2n52ntr0av39lye9fx5gl",
        "cheqd1yqj0s0htaseqc9prkcsmucme3ef5fsyq5mkqrd",
        "cheqd1zh8g8lw0zhp0qk0fxjq9n5p2yjc4xgpca5gzds",
        "cheqd1zhqu2pzpsv0x5afmw3tm5579pqxy59msh8ytj3",
        "cheqd1zhw4qtrd04kp7zz329zjlwy0s3vjunxua6rrqd",
        "cheqd1zm2pz9gj4vsl278vydapx0x8e3fguvxalg7n98",
        "cheqd1zmxl82zfgqsc0efuyhateaen8mzp7ngkaw4qxz",
        "cheqd1zu4mm0lzhm7az4fwc6d28pkt2vvpte5ye45rgv",
        "cheqd1zym5ync279m2sxx99dhtv4s00apr08lzw2g8g8",
        "cheqd1zz0gck564g3dvaxctccc5kgxw2sgtes7p2led6",
        "delayed:cheqd10vmxqqnc9j7axh808ymyz8t8kneux5n8xmmhq9",
        "delayed:cheqd14c5zvsf74uayyp90mav49gx2aj250s8u8yv7y9",
        "delayed:cheqd15yd3fnn3ev5xeacazejgejd5jxrnpusg8mgu8h",
        "delayed:cheqd15zw9j5e3l4l3k6fex8e7hznzmf0mpz5vcwlrt3",
        "delayed:cheqd17n6mefp8vhyrtvavc9fd9hg0hx624skgdjtrpz",
        "delayed:cheqd184z8z58dmax77csg0a9tneku0sqskeqymx5hxw",
        "delayed:cheqd18jc49zfkew8aj8zmxjyrk3nr8asqu8jxg56fwz",
        "delayed:cheqd198yncktukks0aqtyk4vq0hw20v67ffr0rm8cla",
        "delayed:cheqd1a0vumnau34trnvjpnqr4ywwaqd89l4s7ytwkk5",
        "delayed:cheqd1ajefdpfng3l66gr2j3ygvh6efrr6twrd3968rk",
        "delayed:cheqd1c5wva37ufnpdypxkxeya9kawrzgay6evnra50u",
        "delayed:cheqd1cpj9vd5e3dyvyj0nds3hanz30zafakdc4h00wj",
        "delayed:cheqd1crws5sz8tdl37v40tjn0lmlu6ztjhxar9jklqz",
        "delayed:cheqd1dy69x2g8vj0sdnutr29lt2wqgxqw98pcxltuu5",
        "delayed:cheqd1eraud0nswfglksl9tl8e5dlemrq5eualjftv3z",
        "delayed:cheqd1ewhshdq9cdhxwx8vrnnffhfe8qw3szryqv4gu7",
        "delayed:cheqd1exe54lymn5mhpjs0vj6yppnecdmtfss2qcd4cq",
        "delayed:cheqd1g3379fkvfc6jgxa66dswzsmzeguryv6zkxca87",
        "delayed:cheqd1gz3suxvpqrdwntnn7r95eerwa3ura92kp4tm8c",
        "delayed:cheqd1jkzd7sn6dzn54tl0y4ztw7n68r0p4aw53f5mqx",
        "delayed:cheqd1k3vc8xplwtqpyt55ysx085lhr09xxvhuq9ddra",
        "delayed:cheqd1kaascflyltj3pp54hwarnat6kmwtw2zvllsqdc",
        "delayed:cheqd1kq5atufq4ryhdld8s7cmy2735uxhh6wdakj9cj",
        "delayed:cheqd1kysvc7hq8944jq68yjg7hqxud66r3ajx8uv5s8",
        "delayed:cheqd1la5de5x52qw8vspwj70g6c6mem02al8sf4z4sm",
        "delayed:cheqd1lp0lq9mhc22y42znga5mvjngjpdj4pgvgzs950",
        "delayed:cheqd1lvgq858vk9hs9stfkkv0dhhvnwv5eczjx4rkjw",
        "delayed:cheqd1m5r4emnpmgnl0xgptk4f4pkrqmnlrzpnhs8aqu",
        "delayed:cheqd1mn83wm6f43f9ls6lsju8w2x4z4rg4rcvmcsq7z",
        "delayed:cheqd1nn7rcyvfd3zqhumuwwj05wvdh4x28f2qs3sex5",
        "delayed:cheqd1ppuya3ezvs2jq7n2e0ygec6r3uhx0gea6hl9vp",
        "delayed:cheqd1pw0z58t0jrtexp26694ycrdgv6ycmt5fcy00vg",
        "delayed:cheqd1q4lkgp3psk2fdxt2pgr0lujyj5fk4lz2wlz8dy",
        "delayed:cheqd1q6wwcqf902ygu8z7dcyhh8ca0u6a5g4kns6he8",
        "delayed:cheqd1qxr4jdgug8dve9kq6vc6pwdhpuyvlsql85xx0z",
        "delayed:cheqd1r2y0ffh5xgkrnzelygz35mprjejaatnah9untf",
        "delayed:cheqd1s0sngupwnkfv84r079x5ct74j8nnxgjfp89p54",
        "delayed:cheqd1ssge5ykw4hvu4jy6eeen7hyxnw72mds6mzj79h",
        "delayed:cheqd1ssjkeq5k385fydn9n7qvcp74pqkxgl8r8eczfq",
        "delayed:cheqd1sueav9pmjy5k8crpg2nuakyssd86kcrrlc0qre",
        "delayed:cheqd1t62uzdkyaw27v59ufyftzccl707k8a6rt9kcgn",
        "delayed:cheqd1w53yz6ylpraykng3sw6r8lunuar7lteavel3x0",
        "delayed:cheqd1x6srspstwx3pdta64d99en9radmaztms6lj0te",
        "delayed:cheqd1y3fvu2ychq7247fkwfna0nn6exl9w6u009tnh7",
        "delayed:cheqd1z8hvr2drwgnfqudkrqhwvdv5p40h8maw7jg92g",
    ];


    return addresses_to_exclude;
}
