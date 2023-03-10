import Video from "../model/Video";
import User from "../model/User";
import Comment from "../model/Comment";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    return res.render("home", { pageTitle: "Home", videos: videos });
  } catch (error) {
    console.log("error: ", error);
  }
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  video.owner._id = String(video.owner._id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  console.log(req.session.user._id, video.owner);
  if (String(req.session.user._id) !== String(video.owner)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Editing video`, video });
};

export const postEdit = async (req, res) => {
  const id = req.params.id;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(req.session._id) !== String(video.owner)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("info", "Done");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Uploading video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumbnail } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      fileUrl: video[0].location,
      thumbnailUrl: thumbnail[0].location,
      owner: _id,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    req.flash("info", "Done");
    return res.redirect("/");
  } catch (error) {
    const errorMsg = error._message;
    return res
      .status(400)
      .render("upload", { pageTitle: "Uploading video", errorMsg: errorMsg });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(req.session.user._id) !== String(video.owner)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  req.flash("info", "Done");
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}`, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos, keyword });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
    body: { text },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const newComment = await Comment.create({
    text,
    owner: _id,
    video: id,
  });
  video.comments.push(newComment._id);
  video.save();
  return res.status(201).json({ newCommentId: newComment._id });
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  const owner = comment.owner;
  const user = req.session.user._id;
  if (String(owner) !== String(user)) {
    req.flash("error", "Not authorized");
    return res.sendStatus(403);
  }
  await Comment.findByIdAndDelete(id);
  req.flash("info", "Done");
  return res.status(200).json({ deletedCommentId: id });
};
