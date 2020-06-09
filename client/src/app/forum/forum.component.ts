import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2 } from '@angular/core';
import { ClientPost, Post } from './post.model';
import { AuthService } from '../auth/auth.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ForumService } from './forum.service';
import { ClientComment } from './comment.model';
import { Subscription } from 'rxjs';

const editorConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,
  height: '15rem',
  minHeight: '5rem',
  maxHeight: '50rem',
  width: 'auto',
  minWidth: '0',
  translate: 'no',
  enableToolbar: true,
  showToolbar: true,
  defaultParagraphSeparator: 'div',
  defaultFontName: 'Arial',
  toolbarHiddenButtons: [
    [
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'justifyFull',
      'indent',
      'outdent',
      'insertUnorderedList',
      'insertOrderedList',
      'fontName'
    ],
    ['backgroundColor', 'customClasses', 'insertVideo', 'insertHorizontalRule', 'removeFormat']
  ],
  customClasses: [
    {
      name: 'quote',
      class: 'quote'
    },
    {
      name: 'redText',
      class: 'redText'
    },
    {
      name: 'titleText',
      class: 'titleText',
      tag: 'h1'
    }
  ]
};

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent implements OnInit, OnDestroy {
  public showPost = false;
  public addNewPost = false;
  public selectedPost: ClientPost;
  public titleDefaultValue: string;
  public messageDefaultValue: string;
  public isEmptyTitle = false;
  public isEmptyMessage = false;
  public isAdmin: boolean;
  public posts: ClientPost[] = [];
  public postsSub: Subscription;
  public loggedInUsername: string;
  private editPostIndex = -1;
  private editCommentIndex = -1;
  private maxDescriptionLength = 60;

  constructor(private forumService: ForumService, private authService: AuthService, private renderer: Renderer2) {
    this.isAdmin = this.authService.getIsAdmin();
    this.loggedInUsername = this.authService.getUsername();
  }

  ngOnInit() {
    this.forumService.getPosts();
    this.postsSub = this.forumService.getPostsUpdatedListener().subscribe((posts: Post[]) => {
      this.posts = posts as ClientPost[];
    });
    document.addEventListener('click', this.onMouseUp.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    document.removeEventListener('click', this.onMouseUp.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  onMouseUp() {
    this.hideEditsPopup();
  }

  onKeyUp(event) {
    if (event.key === 'Escape') {
      this.hideEditsPopup();
    }
  }

  hideEditsPopup() {
    this.posts.forEach((post: ClientPost) => {
      post.showEdits = false;
      post.comments.forEach((comment: ClientComment) => {
        comment.showEdits = false;
      });
    });
  }

  onPostClick(post: ClientPost) {
    this.showPost = !this.showPost;

    if (!post && this.selectedPost) {
      this.selectedPost.onEditPostMode = false;
      this.selectedPost = null;
    }

    this.selectedPost = post;
  }

  getCommentVotes(comment: ClientComment) {
    let votes = 0;

    comment.votes.forEach((vote) => {
      if (vote.isUp) {
        votes++;
      } else {
        votes--;
      }
    });

    return votes;
  }

  voteUp(comment) {
    this.forumService.vote(comment, {
      id: null,
      username: this.authService.getUsername(),
      isUp: true
    });
  }

  voteDown(comment) {
    this.forumService.vote(comment, {
      id: null,
      username: this.authService.getUsername(),
      isUp: false
    });
  }

  getShortDescription(content: string) {
    const dom = new DOMParser().parseFromString(content, 'text/html');
    let text = Array.from(dom.body.childNodes)
      .map((node) => node.textContent)
      .join('\n');

    if (text.length > this.maxDescriptionLength) {
      text = `${text.substring(0, this.maxDescriptionLength)}...`;
    }

    let linesBuilder = '';
    const lines = text.split('\n');
    lines.forEach((line) => (linesBuilder += `<div>${line}</div>`));
    const description = new DOMParser().parseFromString(linesBuilder, 'text/html').body.innerHTML;

    return description;
  }

  getEditorConfig() {
    return editorConfig;
  }

  getRecentDate(commentOrPost: any): string {
    let dateStr = '';

    if (commentOrPost && commentOrPost.dates && commentOrPost.dates.length > 0) {
      const dateNumber = commentOrPost.dates[commentOrPost.dates.length - 1];
      dateStr = this.getDate(dateNumber);
    }

    return dateStr;
  }

  getDate(date: number) {
    const objDate = new Date(date);
    const dateStr = `${this.getDayStr(objDate.getDay())}
      ${this.getMonthStr(objDate.getMonth())}
      ${objDate.getDate()}
      ${objDate.getFullYear()}
      ${this.getTime(objDate)}`;

    return dateStr;
  }

  getTime(date) {
    return `${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}:${this.formatTime(
      date.getSeconds()
    )}`;
  }

  formatTime(digits: number): string {
    let timeStr = '';

    if (digits < 10) {
      timeStr = `0${digits}`;
    } else {
      timeStr = `${digits}`;
    }

    return timeStr;
  }

  getMonthStr(month: number) {
    let monthStr = '';

    switch (month) {
      case 0:
        monthStr = 'Jan';
        break;
      case 1:
        monthStr = 'Feb';
        break;
      case 2:
        monthStr = 'Mar';
        break;
      case 3:
        monthStr = 'Apr';
        break;
      case 4:
        monthStr = 'May';
        break;
      case 5:
        monthStr = 'Jun';
        break;
      case 6:
        monthStr = 'Jul';
        break;
      case 7:
        monthStr = 'Aug';
        break;
      case 8:
        monthStr = 'Sep';
        break;
      case 9:
        monthStr = 'Oct';
        break;
      case 10:
        monthStr = 'Nov';
        break;
      case 11:
        monthStr = 'Dec';
        break;
    }

    return monthStr;
  }

  getDayStr(day: number) {
    let dayStr = '';

    switch (day) {
      case 0:
        dayStr = 'Sun';
        break;
      case 1:
        dayStr = 'Mon';
        break;
      case 2:
        dayStr = 'Tue';
        break;
      case 3:
        dayStr = 'Wed';
        break;
      case 4:
        dayStr = 'Thu';
        break;
      case 5:
        dayStr = 'Fri';
        break;
      case 6:
        dayStr = 'Sat';
        break;
    }

    return dayStr;
  }

  reset(resetSelectedPost?: boolean) {
    this.titleDefaultValue = '';
    this.messageDefaultValue = '';
    this.editPostIndex = -1;
    this.editCommentIndex = -1;

    if (resetSelectedPost) {
      this.selectedPost = null;
    }
  }

  onSubmitPost(title?: string, content?: string) {
    const post: ClientPost = {
      id: null,
      currentTitle:
        title || (this.selectedPost ? (this.selectedPost.currentTitle ? this.selectedPost.currentTitle : '') : ''),
      currentContent:
        content ||
        (this.selectedPost ? (this.selectedPost.currentContent ? this.selectedPost.currentContent : '') : ''),
      currentDate: 0,
      titles: title ? [title] : this.selectedPost ? this.selectedPost.titles : [''],
      contents: content ? [content] : this.selectedPost ? this.selectedPost.contents : [''],
      author: this.authService.getUsername(),
      dates: [0],
      comments: [],
      onEditPostMode: false,
      showEdits: false
    };

    if (this.editPostIndex >= 0) {
      const oldPost = this.posts[this.editPostIndex];
      oldPost.onEditPostMode = false;
      post.id = oldPost.id;
      post.comments = oldPost.comments;
      post.currentDate = oldPost.currentDate;
      post.dates = oldPost.dates;
      this.forumService.updatePost(post, oldPost);
      this.reset();
    } else {
      this.addNewPost = !this.addNewPost;
      this.forumService.addPost(post);
      this.reset(true);
    }

    this.authService.resetErrorMessages();
  }

  onSubmitComment(title?: string, content?: string) {
    if (this.editCommentIndex >= 0) {
      const comment = this.selectedPost.comments[this.editCommentIndex];
      comment.onEditPostMode = false;
      this.forumService.updateComment(comment);
    } else {
      const comment: ClientComment = {
        id: null,
        postId: this.selectedPost.id,
        currentTitle: title || '',
        currentContent: content || '',
        currentDate: 0,
        titles: [title],
        contents: [content],
        dates: [0],
        author: this.authService.getUsername(),
        onEditPostMode: false,
        showEdits: false,
        votes: new Map()
      };

      this.forumService.addComment(this.selectedPost, comment);
    }

    this.reset();
    this.authService.resetErrorMessages();
  }

  onEditDateClicked(event: MouseEvent, commentOrPost: any, date: string) {
    const dateIndex = commentOrPost.dates.indexOf(date);
    commentOrPost.currentTitle = commentOrPost.titles[dateIndex];
    commentOrPost.currentContent = commentOrPost.contents[dateIndex];
    commentOrPost.currentDate = commentOrPost.dates[dateIndex];
    commentOrPost.showEdits = false;
    let target: HTMLElement = event.target as HTMLElement;

    while (!target.classList.contains('container')) {
      target = target.parentElement;
    }

    this.renderer.addClass(target, 'changed');

    setTimeout(() => {
      this.renderer.removeClass(target, 'changed');
    }, 300);
  }

  onShowEdits(commentOrPost: any) {
    const show = !commentOrPost.showEdits;
    this.hideEditsPopup();
    commentOrPost.showEdits = show;
  }

  onAddNewPostClick() {
    this.addNewPost = !this.addNewPost;
    this.reset(true);
  }

  onDeletePostClick(post: ClientPost) {
    const index: number = this.posts.indexOf(post);
    this.showPost = false;

    if (index >= 0) {
      this.forumService.deletePost(post.id, index);
    }

    this.reset(true);
  }

  onDeleteCommentClick(comment: ClientComment) {
    const index: number = this.selectedPost.comments.indexOf(comment);

    if (index >= -1) {
      this.forumService.deleteComment(this.selectedPost, comment);
    }
  }

  onEditPostClick(post: ClientPost) {
    if (post) {
      const index: number = this.posts.indexOf(post);

      if (index >= 0) {
        this.selectedPost = this.posts[index];
        this.posts[index].onEditPostMode = true;
        this.editPostIndex = index;
      }
    } else if (this.selectedPost) {
      this.selectedPost.onEditPostMode = false;
    }
  }

  onEditCommentClick(comment: ClientComment) {
    if (comment) {
      const commentIndex: number = this.selectedPost.comments.indexOf(comment);
      const postIndex: number = this.posts.indexOf(this.selectedPost);

      if (postIndex >= 0 && commentIndex >= 0) {
        this.selectedPost.comments[commentIndex].onEditPostMode = true;
        this.editCommentIndex = commentIndex;
        this.editPostIndex = postIndex;
      }
    } else if (this.selectedPost && this.selectedPost.comments && this.editCommentIndex >= 0) {
      this.selectedPost.comments[this.editCommentIndex].onEditPostMode = false;
    }
  }
}
