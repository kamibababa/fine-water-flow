import React, { Component } from "react";
import { Layout, Row, Col, Icon, Modal, Table, Affix } from "antd";
import axios from "axios";
import "rc-texty/assets/index.css";
import dayjs from "dayjs";

import Nav from "../Nav";
import Myfooter from "../Myfooter";
import AvatarF from "../AvatarF";

const count = 6;

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_1242637_n0895drewt.js",
});

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "发布时间",
    dataIndex: "pub_date",
    key: "pub_date",
    render: (text) => <div>{dayjs(text).format("YYYY MM-DD")}</div>,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    render: (text) => <div>{text == "2" ? "发布" : "草稿"}</div>,
  },
  {
    title: "原创",
    dataIndex: "originality",
    key: "originality",
    render: (text) => <div>{text == "2" ? "是" : "否"}</div>,
  },
  {
    title: "观看数",
    dataIndex: "views",
    key: "views",
  },
];

class OwnerCollectionPage extends Component {
  page = 1;
  state = {
    data: "",
    loading: false,
    articles: [],
    id: "",
    name: "",
    authorId: "",
    views: 0,
    pubDate: "",
    key: "",
    article: "",
    addVisible: false,
    cache: [],
    selectedRowKeys: [],
    articleData: [],
    loading: false,
    initLoading: true,
    search: "",
    page: 1,
  };

  getArticleData = async (v) => {
    try {
      let config = {
        headers: {
          Authorization: "Token " + window.localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        "https://101.200.52.246:8080/api/owner_articles/?format=json" +
          "&page=" +
          this.page +
          "&page_size=" +
          count +
          "&search=" +
          this.state.search,
        config
      );
      const temp = [];
      for (let index = 0; index < response.data.count; index++) {
        temp.push({ title: "", cover: "", author: "", id: index });
      }
      this.setState({
        cache: temp,
      });
      for (let index = 0; index < response.data.results.length; index++) {
        temp[index] = response.data.results[index];
      }
      this.setState({
        cache: temp,
        count: response.data.count,
      });
    } catch (error) {
      console.log(error);
    }
  };

  getData = async (v) => {
    try {
      let url =
        "https://101.200.52.246:8080/api/owner_collections/" +
        this.props.match.params.id;
      let config = {
        headers: {
          Authorization: "Token " + window.localStorage.getItem("token"),
        },
      };
      const response = await axios.get(url, config);
      const tempSelected = [];
      for (let index = 0; index < response.data.article.length; index++) {
        tempSelected.push(response.data.article[index].id);
      }
      this.setState(function (state) {
        return {
          data: response.data,
          name: response.data.name,
          articles: response.data.article,
          id: response.data.id,
          url: response.data.url,
          loading: false,
          authorId: response.data.user.id,
          pubDate: response.data.pub_date,
          views: response.data.views,
          key:
            response.data.article.length > 0 ? response.data.article[0].id : "",
          selectedRowKeys: tempSelected,
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  getArticle = async (v) => {
    try {
      let url = "https://101.200.52.246:8080/api/owner_articles/" + v;
      let config = {
        headers: {
          Authorization: "Token " + window.localStorage.getItem("token"),
        },
      };
      const response = await axios.get(url, config);
      this.setState({
        article: response.data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  componentDidMount = async (v) => {
    await this.getData();
    await this.getArticle(this.state.key);
    await this.getArticleData();
    this.setState({
      initLoading: false,
    });
  };

  handleClick = async (value) => {
    this.setState({
      key: value,
    });
    this.getArticle(value);
  };

  showAddModal = () => {
    this.setState({
      addVisible: true,
    });
  };

  handleCancelAdd = (e) => {
    this.setState({
      addVisible: false,
    });
  };

  onSelectChange = (selectedRowKeys) => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  search = async (value) => {
    this.setState({
      loading: true,
      search: value,
    });
    this.getArticleData();
    this.setState({
      loading: false,
    });
  };

  handArticlePage = async (page) => {
    await this.setState({
      loading: true,
    });
    try {
      let config = {
        headers: {
          Authorization: "Token " + window.localStorage.getItem("token"),
        },
      };
      const response = await axios.get(
        "https://101.200.52.246:8080/api/owner_articles/?format=json" +
          "&page=" +
          page +
          "&page_size=" +
          count +
          "&search=" +
          this.state.search,
        config
      );
      let temp = this.state.cache;
      let i = (page - 1) * count;
      for (let index = 0; index < response.data.results.length; index++) {
        temp[i] = response.data.results[index];
        i++;
      }
      this.setState({
        cache: temp,
        loading: false,
      });
      console.log(this.state.cache);
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Nav />
        <Modal
          title="增加文章"
          visible={this.state.addVisible}
          onCancel={this.handleCancelAdd}
          centered
          footer={null}
          width={860}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              fontWeight: "bold",
              color: "#000",
              marginBottom: "4px",
            }}
          >
            已添加文章 ：
            {selectedRowKeys.map((item) => (
              <div
                style={{
                  backgroundColor: "#ffd6e7",
                  padding: "6px 8px",
                  margin: "0 6px",
                  borderRadius: "6px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            新添加文章 ：
            {selectedRowKeys.map((item) => (
              <div
                style={{
                  backgroundColor: "#b7eb8f",
                  padding: "6px 8px",
                  margin: "0 6px",
                  borderRadius: "6px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <Table
            style={{ margin: "8px 0" }}
            size="large"
            columns={columns}
            rowSelection={rowSelection}
            dataSource={this.state.cache}
            loading={this.state.loading}
            scroll={{ y: this.state.y }}
            bordered
            rowKey={(record) => record.id}
            tableLayout="fixed"
            expandedRowRender={(record) => (
              <div dangerouslySetInnerHTML={{ __html: record.content }}></div>
            )}
            pagination={{
              onChange: this.handArticlePage,
              pageSize: count,
              total: this.state.cache.length,
              showQuickJumper: true,
            }}
          />
        </Modal>
        <div
          style={{ flex: "1 0", minHeight: "100vh", backgroundColor: "#fff" }}
        >
          <Row style={{ paddingTop: "30px", paddingBottom: "30px" }}>
            <Col
              xxl={{ span: 14, offset: 5 }}
              xl={{ span: 20, offset: 2 }}
              xs={{ span: 22, offset: 1 }}
              style={{ marginBottom: "30px" }}
            >
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "bold",
                  color: "black",
                  backgroundColor: "#d6e4ff",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                {this.state.name}
              </div>
            </Col>
            <Col
              xxl={{ span: 3, offset: 5 }}
              xl={{ span: 5, offset: 2 }}
              xs={{ span: 22, offset: 1 }}
            >
              <Affix offsetTop={10}>
                <div
                  style={{
                    backgroundColor: "#fff",
                    border: "2px solid gray",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#d6e4ff",
                      marginBottom: "12px",
                      fontWeight: "bold",
                      color: "#000",
                      fontSize: "18px",
                      padding: "16px 14px",
                    }}
                  >
                    目录 ({" "}
                    {this.state.data.article && this.state.data.article.length}{" "}
                    )
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      margin: "8px 12px",
                    }}
                  >
                    <IconFont
                      type="icon-zengjia1"
                      style={{ fontSize: "32px", marginRight: "12px" }}
                      onClick={this.showAddModal}
                    />
                  </div>
                  <div style={{ margin: "0 5px" }}>
                    {this.state.articles &&
                      this.state.articles.map((item) => (
                        <div
                          onClick={() => this.handleClick(item.id)}
                          className="box"
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color:
                              this.state.key == item.id ? "#096dd9" : "gray",
                            padding: "12px",
                            marginBottom: "6px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            border:
                              this.state.key == item.id
                                ? "2px solid gray"
                                : "1px solid gray",
                            backgroundColor:
                              this.state.key == item.id ? "#bae7ff" : "white",
                          }}
                        >
                          <div>{item.title}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </Affix>
            </Col>
            <Col
              xxl={{ span: 10, offset: 1 }}
              xl={{ span: 14, offset: 1 }}
              xs={{ span: 22, offset: 1 }}
              style={{}}
            >
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "bold",
                  marginBottom: "26px",
                  display: "flex",
                  justifyContent: "center",
                  color: "#000",
                }}
              >
                {this.state.article && this.state.article.title}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "28px 0",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                  {"发布于 " +
                    dayjs(this.state.article.pub_date).format("YYYY MM-DD")}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      marginRight: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    作者 :{" "}
                  </div>
                  <AvatarF
                    user={this.state.article && this.state.article.user}
                  ></AvatarF>
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: this.state.article && this.state.article.content,
                }}
              ></div>
            </Col>
          </Row>
        </div>
        <Myfooter />
      </Layout>
    );
  }
}

export default OwnerCollectionPage;
