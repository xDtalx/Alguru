import { compileNgModule } from '@angular/compiler';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../theme/theme.service';
import { IClientComment } from './comment.model';
import { ForumService } from './forum.service';
import { IClientPost, IPost } from './post.model';

const editorConfig: AngularEditorConfig = {
  height: '15rem',
  editable: true,
  spellcheck: true,
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
      class: 'quote',
      name: 'quote'
    },
    {
      class: 'redText',
      name: 'redText'
    },
    {
      class: 'titleText',
      name: 'titleText',
      tag: 'h1'
    }
  ]
};

@Component({
  selector: 'app-forum',
  styleUrls: ['./forum.component.css'],
  templateUrl: './forum.component.html'
})
export class ForumComponent implements OnInit, OnDestroy, AfterViewInit {
  public showPost = false;
  public showWelcome = false;
  public addNewPost = false;
  public selectedPost: IClientPost;
  public titleDefaultValue: string;
  public messageDefaultValue: string;
  public isEmptyTitle = false;
  public isEmptyMessage = false;
  public isAdmin: boolean;
  public posts: IClientPost[] = [];
  public postsSub: Subscription;
  public authSub: Subscription;
  public loggedInUsername: string;
  public isAuth: boolean;
  public verified: boolean;
  public emailSent: boolean;
  private editPostIndex = -1;
  private editCommentIndex = -1;
  private maxDescriptionLength = 60;
  private theme = 'dark';
  private selectedPostId: string;

  constructor(
    private forumService: ForumService,
    private authService: AuthService,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private route: ActivatedRoute
  ) {}

  public ngAfterViewInit(): void {
    document.documentElement.style.setProperty('--site-background-img', 'none');
  }

  public ngOnInit() {
    this.initTheme();
    this.isAuth = this.authService.getIsAuth();
    this.verified = this.authService.isVerified();

    if (this.isAuth) {
      this.isAdmin = this.authService.getIsAdmin();
      this.loggedInUsername = this.authService.getUsername();
    }

    this.authSub = this.authService.getAuthStatusListener().subscribe((isAuth) => {
      this.isAuth = isAuth;

      if (!isAuth) {
        this.loggedInUsername = null;
        this.isAdmin = false;
      }
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.selectedPostId = paramMap.get('postId');
      }
    });

    if (!this.selectedPostId) {
      this.postsSub = this.forumService.getPostsUpdatedListener().subscribe((posts: IPost[]) => {
        this.posts = posts as IClientPost[];
        this.onPostClick(this.selectedPostId);
        this.showWelcome = this.posts.length === 0;
      });
      this.forumService.getPosts();
    } else {
      this.postsSub = this.forumService.getPostUpdatedListener().subscribe((post: IPost) => {
        this.posts = [post as IClientPost];
        this.onPostClick(this.selectedPostId);
      });
      this.forumService.getPost(this.selectedPostId);
    }

    document.addEventListener('click', this.onMouseUp.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public ngOnDestroy() {
    this.authSub.unsubscribe();
    this.postsSub.unsubscribe();
    this.themeService.reset();
    document.removeEventListener('click', this.onMouseUp.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
  }

  public onMouseUp() {
    this.hideEditsPopup();
  }

  public onKeyUp(event) {
    if (event.key === 'Escape') {
      this.hideEditsPopup();
    }
  }

  public initTheme() {
    this.themeService.overrideProperty('--main-display', 'block');
    this.themeService.overrideProperty(
      '--site-background-img',
      'url("assets/home-page/homePageBackground.png") no-repeat'
    );
    this.themeService.overrideProperty('--main-padding', '3rem 0 0 0');
    this.themeService.setActiveThemeByName(this.theme);
  }

  public hideEditsPopup() {
    this.posts.forEach((post: IClientPost) => {
      post.showEdits = false;
      post.comments.forEach((comment: IClientComment) => {
        comment.showEdits = false;
      });
    });
  }

  public onPostClick(postId: string) {
    let clickedPost;

    if (this.posts.length > 0) {
      for (const post of this.posts) {
        if (post.id === postId) {
          clickedPost = post;
          break;
        }
      }

      if (postId) {
        this.showPost = true;
      } else {
        this.showPost = false;
      }

      if (!clickedPost && this.selectedPost) {
        this.selectedPost.onEditPostMode = false;
        this.selectedPost = null;
      }

      this.selectedPost = clickedPost;
    }
  }

  public getVotes(commentOrPost: any) {
    let votes = 0;

    commentOrPost.votes.forEach((vote) => {
      if (vote.isUp) {
        votes++;
      } else {
        votes--;
      }
    });

    return votes;
  }

  public voteUp(commentOrPost: any, isComment: boolean) {
    if (this.isAuth) {
      this.forumService.vote(commentOrPost, isComment, {
        id: null,
        isUp: true,
        username: this.authService.getUsername()
      });
    }
  }

  public voteDown(commentOrPost: any, isComment: boolean): void {
    if (this.isAuth) {
      this.forumService.vote(commentOrPost, isComment, {
        id: null,
        isUp: false,
        username: this.authService.getUsername()
      });
    }
  }

  public resendVarificationEmail(): void {
    this.authService.resendVarificationEmail();
    this.emailSent = true;
  }

  public getShortDescription(content: string): string {
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

  public getEditorConfig() {
    return editorConfig;
  }

  public getRecentDate(commentOrPost: any): string {
    let dateStr = '';

    if (commentOrPost && commentOrPost.dates && commentOrPost.dates.length > 0) {
      const dateNumber = commentOrPost.dates[commentOrPost.dates.length - 1];
      dateStr = this.getDate(dateNumber);
    }

    return dateStr;
  }

  public getDate(date: number) {
    const objDate = new Date(date);
    const dateStr = `${this.getDayStr(objDate.getDay())}
      ${this.getMonthStr(objDate.getMonth())}
      ${objDate.getDate()}
      ${objDate.getFullYear()}
      ${this.getTime(objDate)}`;

    return dateStr;
  }

  public getTime(date) {
    return `${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}:${this.formatTime(
      date.getSeconds()
    )}`;
  }

  public formatTime(digits: number): string {
    let timeStr = '';

    if (digits < 10) {
      timeStr = `0${digits}`;
    } else {
      timeStr = `${digits}`;
    }

    return timeStr;
  }

  public getMonthStr(month: number) {
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

  public getDayStr(day: number) {
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

  public reset(resetSelectedPost?: boolean) {
    this.titleDefaultValue = '';
    this.messageDefaultValue = '';
    this.editPostIndex = -1;
    this.editCommentIndex = -1;

    if (resetSelectedPost) {
      this.selectedPost = null;
    }
  }

  public onSubmitPost(title?: string, content?: string) {
    const post: IClientPost = {
      author: this.authService.getUsername(),
      comments: [],
      contents: content ? [content] : this.selectedPost ? this.selectedPost.contents : [''],
      currentContent:
        content ||
        (this.selectedPost ? (this.selectedPost.currentContent ? this.selectedPost.currentContent : '') : ''),
      currentDate: 0,
      currentTitle:
        title || (this.selectedPost ? (this.selectedPost.currentTitle ? this.selectedPost.currentTitle : '') : ''),
      dates: [0],
      id: null,
      onEditPostMode: false,
      showEdits: false,
      titles: title ? [title] : this.selectedPost ? this.selectedPost.titles : [''],
      votes: new Map()
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

  public onSubmitComment(content?: string) {
    if (this.editCommentIndex >= 0) {
      const comment = this.selectedPost.comments[this.editCommentIndex];
      comment.onEditPostMode = false;
      this.forumService.updateComment(comment);
    } else {
      const comment: IClientComment = {
        author: this.authService.getUsername(),
        contents: [content],
        currentContent: content || '',
        currentDate: 0,
        currentTitle: null,
        dates: [0],
        id: null,
        onEditPostMode: false,
        postId: this.selectedPost.id,
        showEdits: false,
        titles: [],
        votes: new Map()
      };

      this.forumService.addComment(this.selectedPost, comment);
    }

    this.reset();
    this.authService.resetErrorMessages();
  }

  public onEditDateClicked(event: MouseEvent, commentOrPost: any, date: string) {
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

  public onShowEdits(commentOrPost: any) {
    const show = !commentOrPost.showEdits;
    this.hideEditsPopup();
    commentOrPost.showEdits = show;
  }

  public onAddNewPostClick() {
    this.addNewPost = !this.addNewPost;
    this.reset(true);
  }

  public onDeletePostClick(post: IClientPost) {
    const index: number = this.posts.indexOf(post);
    this.showPost = false;

    if (index >= 0) {
      this.forumService.deletePost(post.id, index);
    }

    this.reset(true);
  }

  public onDeleteCommentClick(comment: IClientComment) {
    const index: number = this.selectedPost.comments.indexOf(comment);

    if (index >= -1) {
      this.forumService.deleteComment(this.selectedPost, comment);
    }
  }

  public onEditPostClick(post: IClientPost) {
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

  public onEditCommentClick(comment: IClientComment) {
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
