import React, { Component } from "react";
import { List, Button, Skeleton, message, Modal, Icon } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import AvatarF from "../AvatarF";

const count = 8;
const confirm = Modal.confirm;
const briefLength = 12;
const IconFont = Icon.createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_1242637_estflglakgj.js",
});

class PubCollectionList extends Component {
  state = {
    data: [],
    cache: [],
    loading: false,
    initLoading: true,
    page: 1,
    next: "",
    status: 1,
    number: 0,
  };

  my(list, key, status) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === key) {
        list[i].status = status;
      }
    }
    return list;
  }

  onClick = async (key, status, title) => {
    if (status === "2") {
      try {
        let url = "https://101.200.52.246:8080/api/owner_collections/" + key;
        let config = {
          headers: {
            Authorization: "Token " + window.localStorage.getItem("token"),
          },
        };
        await axios.patch(url, { status: "1" }, config);
        const temp = this.state.cache;
        this.my(temp, key, "1");
        this.setState({
          cache: temp,
        });
        message.success(title + "  已进入草稿箱");
      } catch (error) {}
    }
    if (status === "1") {
      try {
        let url = "https://101.200.52.246:8080/api/owner_collections/" + key;
        let config = {
          headers: {
            Authorization: "Token " + window.localStorage.getItem("token"),
          },
        };
        await axios.patch(url, { status: "2" }, config);
        const temp = this.state.cache;
        this.my(temp, key, "2");
        this.setState({
          cache: temp,
        });
        message.success(title + "  已发布成功");
      } catch (error) {}
    }
  };

  componentDidMount = async (v) => {
    await this.getCollectionData();
    this.setState(function (state) {
      return { initLoading: false };
    });
  };

  extractText = (HTMLString) => {
    var span = document.createElement("span");
    span.innerHTML = HTMLString;
    return span.textContent || span.innerText;
  };

  extractBrief = (HTMLString) => {
    const text = this.extractText(HTMLString);
    if (text.length > briefLength) {
      return text.slice(0, briefLength) + "……";
    }
    return text;
  };

  getCollectionData = async (v) => {
    try {
      const response = await axios.get(
        "https://101.200.52.246:8080/api/collections/?format=json" +
          "&page=" +
          this.state.page +
          "&page_size=" +
          count
      );
      this.setState(function (state) {
        return {
          data: response.data.results,
          cache: response.data.results,
          next: response.data.next,
          number: response.data.count,
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  onLoadMore = async (v) => {
    await this.setState({
      loading: true,
      cache: this.state.data.concat(
        [...new Array(count)].map(() => ({ loading: true, name: {} }))
      ),
    });
    try {
      this.state.page = this.state.page + 1;
      const response = await axios.get(
        "https://101.200.52.246:8080/api/collections/?format=json" +
          "&page=" +
          this.state.page +
          "&page_size=" +
          count
      );
      this.setState({
        next: response.data.next,
      });
      const temp1 = this.state.data;
      if (response.status === 200) {
        const temp = this.state.data.concat(response.data.results);
        this.setState({ data: temp, cache: temp, loading: false }, () => {
          window.dispatchEvent(new window.Event("resize"));
        });
      } else {
        this.setState({
          cache: temp1,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { initLoading, loading, cache, next } = this.state;
    const loadMore =
      !initLoading && !loading && next ? (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            height: 32,
            lineHeight: "32px",
          }}
        >
          {this.state.cache.length > 0 && (
            <Button onClick={this.onLoadMore}>加载更多</Button>
          )}
        </div>
      ) : null;

    return (
      <div className="queue-demo">
        <div>
          <List
            dataSource={cache}
            size="small"
            loadMore={loadMore}
            loading={initLoading}
            grid={{
              gutter: 36,
              xxl: 1,
              xl: 2,
              md: 1,
              xs: 1
            }}
            style={{ paddingBottom: "20px", marginTop: "26px" }}
            renderItem={(item) => (
              <List.Item
                style={{
                  backgroundColor: "#f0f0f0",
                  boxShadow: "6px 6px 15px #e6e6e6",
                  padding: "26px",
                  borderRadius: "10px",
                }}
              >
                <Skeleton avatar title={false} loading={item.loading} active>
                  <Link to={"/owner_collection_page/" + item.id}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <div>
                        <div
                          style={{
                            color: "#1a1a1a",
                            fontWeight: "600",
                            fontSize: "22px",
                            fontStretch: "100%",
                          }}
                        >
                          {this.extractBrief(item.name)}
                        </div>
                        <div style={{ margin: "12px 0", color: "black" }}>
                          {"文章数： " + (item.article && item.article.length)}
                        </div>
                        <div>{dayjs(item.pub_date).format("YYYY MM-DD")}</div>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <AvatarF user={item.user}></AvatarF>
                        <div style={{marginTop: '8px', fontSize: '12px', color: 'black'}}>{item.user.username}</div>
                      </div>
                    </div>
                  </Link>
                </Skeleton>
              </List.Item>
            )}
          />
        </div>
      </div>
    );
  }
}

export default PubCollectionList;
